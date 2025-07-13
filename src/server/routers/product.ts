import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ownerProcedure, protectedProcedure, router } from "../trpc";

export const productRouter = router({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		const products = await ctx.prisma.product.findMany({
			orderBy: { name: "asc" },
		});
		return products;
	}),

	getById: protectedProcedure
		.input(z.string().uuid())
		.query(async ({ ctx, input }) => {
			const product = await ctx.prisma.product.findUnique({
				where: { id: input },
			});

			if (!product) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: `Product with ID ${input} not found`,
				});
			}

			return product;
		}),

	create: ownerProcedure
		.input(
			z.object({
				name: z.string().min(1),
				price: z.number().positive(),
				category: z.enum(["SERVICE", "PRODUCT"]),
				description: z.string(),
				bonusPercentageForBarber: z.number().min(0).max(100),
				bonusPercentageForCashier: z.number().min(0).max(100),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const product = await ctx.prisma.product.create({
				data: input,
			});

			return product;
		}),

	update: ownerProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().min(1),
				price: z.number().positive(),
				category: z.enum(["SERVICE", "PRODUCT"]),
				description: z.string(),
				bonusPercentageForBarber: z.number().min(0).max(100),
				bonusPercentageForCashier: z.number().min(0).max(100),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;

			const product = await ctx.prisma.product.update({
				where: { id },
				data,
			});

			return product;
		}),

	delete: ownerProcedure
		.input(z.string().uuid())
		.mutation(async ({ ctx, input }) => {
			const product = await ctx.prisma.product.delete({
				where: { id: input },
			});

			return product;
		}),
});
