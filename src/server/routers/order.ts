import { z } from "zod";
import { router, cashierProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

// Define the OrderItem schema
const orderItemSchema = z.object({
	productId: z.uuid(),
	quantity: z.number().int().positive(),
});

// Define a simple type for our order item preparation
type OrderItemData = {
	productId: string;
	productName: string;
	productPrice: number;
	quantity: number;
	barberBonus: number;
	cashierBonus: number;
};

export const orderRouter = router({
	create: cashierProcedure
		.input(
			z.object({
				barberId: z.string().uuid(),
				items: z.array(orderItemSchema).min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { barberId, items } = input;
			const cashierId = ctx.token.employeeId;

			if (!cashierId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cashier ID not found in token",
				});
			}

			// Get all products for the order items
			const productIds = items.map((item) => item.productId);
			const products = await ctx.prisma.product.findMany({
				where: { id: { in: productIds } },
			});

			// Create a map for easy lookup
			const productMap = new Map(
				products.map((product) => [product.id, product]),
			);

			// Calculate the total price and prepare order items
			let totalPrice = 0;

			// Use a simpler type for preparation
			const orderItemsData: OrderItemData[] = items.map((item) => {
				const product = productMap.get(item.productId);

				if (!product) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: `Product with ID ${item.productId} not found`,
					});
				}

				const subtotal = product.price * item.quantity;
				const barberBonus = subtotal * (product.bonusPercentageForBarber / 100);
				const cashierBonus =
					subtotal * (product.bonusPercentageForCashier / 100);

				totalPrice += subtotal;

				return {
					productId: product.id,
					productName: product.name,
					productPrice: product.price,
					quantity: item.quantity,
					barberBonus,
					cashierBonus,
				};
			});

			// Create order and order items in a transaction
			const result = await ctx.prisma.$transaction(async (tx) => {
				// First create the order
				const order = await tx.order.create({
					data: {
						totalPrice,
						cashierId,
						barberId,
					},
					include: {
						cashier: true,
						barber: true,
					},
				});

				// Return the full order with items
				return tx.order.findUnique({
					where: { id: order.id },
					include: {
						orderItems: true,
						cashier: true,
						barber: true,
					},
				});
			});

			return result;
		}),

	getAll: protectedProcedure
		.input(
			z
				.object({
					limit: z.number().int().min(1).max(100).optional(),
					cursor: z.string().optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const limit = input?.limit ?? 50;
			const cursor = input?.cursor;

			const orders = await ctx.prisma.order.findMany({
				take: limit + 1,
				...(cursor && { cursor: { id: cursor } }),
				orderBy: { createdAt: "desc" },
				include: {
					cashier: true,
					barber: true,
					orderItems: {
						include: {
							product: true,
						},
					},
				},
			});

			let nextCursor: string | undefined = undefined;
			if (orders.length > limit) {
				const nextItem = orders.pop();
				nextCursor = nextItem?.id;
			}

			return {
				orders,
				nextCursor,
			};
		}),

	getById: protectedProcedure
		.input(z.string().uuid())
		.query(async ({ ctx, input }) => {
			const order = await ctx.prisma.order.findUnique({
				where: { id: input },
				include: {
					cashier: true,
					barber: true,
					orderItems: {
						include: {
							product: true,
						},
					},
				},
			});

			if (!order) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: `Order with ID ${input} not found`,
				});
			}

			return order;
		}),
});
