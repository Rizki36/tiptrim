import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ownerProcedure, protectedProcedure, router } from "../trpc";

export const employeeRouter = router({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		const employees = await ctx.prisma.employee.findMany({
			where: { deletedAt: null },
			orderBy: { name: "asc" },
		});
		return employees;
	}),

	getBarbers: protectedProcedure.query(async ({ ctx }) => {
		const barbers = await ctx.prisma.employee.findMany({
			where: {
				role: "BARBER",
				deletedAt: null,
			},
			orderBy: { name: "asc" },
		});
		return barbers;
	}),

	getById: protectedProcedure
		.input(z.string().uuid())
		.query(async ({ ctx, input }) => {
			const employee = await ctx.prisma.employee.findUnique({
				where: { id: input },
				include: { user: true },
			});

			if (!employee) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: `Employee with ID ${input} not found`,
				});
			}

			return employee;
		}),

	create: ownerProcedure
		.input(
			z.object({
				name: z.string().min(1),
				role: z.enum(["BARBER", "CASHIER"]),
				username: z.string().min(1),
				password: z.string().min(6),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { name, role, username, password } = input;

			// Check if username already exists
			const existingUser = await ctx.prisma.user.findUnique({
				where: { username },
			});

			if (existingUser) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Username already exists",
				});
			}

			// Create employee with user in a transaction
			const result = await ctx.prisma.$transaction(async (tx) => {
				const employee = await tx.employee.create({
					data: { name, role },
				});

				const user = await tx.user.create({
					data: {
						username,
						password, // Note: In a real app, we should hash this first
						role: "EMPLOYEE",
						employeeId: employee.id,
					},
				});

				return { employee, user };
			});

			return result.employee;
		}),

	update: ownerProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().min(1),
				role: z.enum(["BARBER", "CASHIER"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, name, role } = input;

			const employee = await ctx.prisma.employee.update({
				where: { id },
				data: { name, role },
			});

			return employee;
		}),

	delete: ownerProcedure
		.input(z.string().uuid())
		.mutation(async ({ ctx, input }) => {
			// Soft delete by setting deletedAt
			const employee = await ctx.prisma.employee.update({
				where: { id: input },
				data: { deletedAt: new Date() },
			});

			return employee;
		}),
});
