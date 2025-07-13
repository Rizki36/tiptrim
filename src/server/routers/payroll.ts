import { z } from "zod";
import { router, ownerProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Order, OrderItem } from "../../../app/generated/prisma";

// Define type for the order items with relations
type OrderItemWithOrder = OrderItem & {
	order: Order;
};

export const payrollRouter = router({
	getAll: ownerProcedure
		.input(
			z
				.object({
					startDate: z.date().optional(),
					endDate: z.date().optional(),
					status: z.enum(["DRAFT", "PAID"]).optional(),
					employeeId: z.string().uuid().optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const where: any = { deletedAt: null };

			if (input?.startDate) {
				where.periodStart = { gte: input.startDate };
			}

			if (input?.endDate) {
				where.periodEnd = { lte: input.endDate };
			}

			if (input?.status) {
				where.status = input.status;
			}

			if (input?.employeeId) {
				where.employeeId = input.employeeId;
			}

			const payrolls = await ctx.prisma.payroll.findMany({
				where,
				include: {
					employee: true,
					payrollItems: true,
				},
				orderBy: { periodEnd: "desc" },
			});

			return payrolls;
		}),

	getById: ownerProcedure
		.input(z.string().uuid())
		.query(async ({ ctx, input }) => {
			const payroll = await ctx.prisma.payroll.findUnique({
				where: { id: input },
				include: {
					employee: true,
					payrollItems: {
						include: {
							orderItem: {
								include: {
									order: true,
								},
							},
						},
					},
				},
			});

			if (!payroll) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: `Payroll with ID ${input} not found`,
				});
			}

			return payroll;
		}),

	create: ownerProcedure
		.input(
			z.object({
				employeeId: z.string().uuid(),
				periodStart: z.date(),
				periodEnd: z.date(),
				amount: z.number().optional(), // Optional because we'll calculate it
				salary: z.number().nonnegative(),
				status: z.enum(["DRAFT", "PAID"]),
				includeOrderItems: z.boolean().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const {
				employeeId,
				periodStart,
				periodEnd,
				status,
				salary,
				includeOrderItems = true,
			} = input;

			// Verify employee exists
			const employee = await ctx.prisma.employee.findUnique({
				where: { id: employeeId },
			});

			if (!employee) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: `Employee with ID ${employeeId} not found`,
				});
			}

			// Get pending order items for this employee in the period
			let orderItems: OrderItemWithOrder[] = [];
			let bonusTotal = 0;

			if (includeOrderItems) {
				const isBarber = employee.role === "BARBER";

				orderItems = await ctx.prisma.orderItem.findMany({
					where: {
						payrollStatus: "PENDING",
						order: {
							createdAt: {
								gte: periodStart,
								lte: periodEnd,
							},
							[isBarber ? "barberId" : "cashierId"]: employeeId,
						},
					},
					include: {
						order: true,
					},
				});

				// Calculate total bonus
				bonusTotal = orderItems.reduce((total, item) => {
					return total + (isBarber ? item.barberBonus : item.cashierBonus);
				}, 0);
			}

			// Calculate total amount
			const amount = salary + bonusTotal;

			// Create payroll and payroll items in a transaction
			return ctx.prisma.$transaction(async (tx) => {
				// Create the payroll
				const payroll = await tx.payroll.create({
					data: {
						employeeId,
						periodStart,
						periodEnd,
						amount,
						status,
						// Add base salary as payroll item
						payrollItems: {
							create: {
								type: "SALARY",
								amount: salary,
							},
						},
					},
				});

				if (includeOrderItems && orderItems.length > 0) {
					// Create payroll items for bonuses
					for (const item of orderItems) {
						const isBarber = employee.role === "BARBER";
						const bonusAmount = isBarber ? item.barberBonus : item.cashierBonus;

						// Create payroll item
						const payrollItem = await tx.payrollItem.create({
							data: {
								type: "BONUS",
								amount: bonusAmount,
								payrollId: payroll.id,
							},
						});

						// Update order item with payroll item ID and status
						await tx.orderItem.update({
							where: { id: item.id },
							data: {
								payrollItemId: payrollItem.id,
								payrollStatus: status === "PAID" ? "PAID" : "PENDING",
							},
						});
					}
				}

				// Fetch the full payroll with relationships
				return tx.payroll.findUnique({
					where: { id: payroll.id },
					include: {
						employee: true,
						payrollItems: true,
					},
				});
			});
		}),

	updateStatus: ownerProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				status: z.enum(["DRAFT", "PAID"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, status } = input;

			return ctx.prisma.$transaction(async (tx) => {
				// Update payroll status
				const payroll = await tx.payroll.update({
					where: { id },
					data: { status },
					include: { payrollItems: true },
				});

				// If marking as paid, update all related order items
				if (status === "PAID") {
					// Get all payroll item IDs
					const payrollItemIds = payroll.payrollItems.map((item) => item.id);

					// Update order items
					await tx.orderItem.updateMany({
						where: { payrollItemId: { in: payrollItemIds } },
						data: { payrollStatus: "PAID" },
					});
				}

				return payroll;
			});
		}),

	delete: ownerProcedure
		.input(z.string().uuid())
		.mutation(async ({ ctx, input }) => {
			// Soft delete
			const payroll = await ctx.prisma.payroll.update({
				where: { id: input },
				data: { deletedAt: new Date() },
			});

			return payroll;
		}),
});
