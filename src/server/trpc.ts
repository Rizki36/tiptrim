import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getToken } from "next-auth/jwt";
import { PrismaClient } from "../../app/generated/prisma";
import superjson from "superjson";

const prisma = new PrismaClient();

/**
 * Context creation
 */
export const createContext = async ({ req, res }: CreateNextContextOptions) => {
	// Get the session from the request
	const token = await getToken({ req });

	return {
		req,
		res,
		prisma,
		token,
	};
};

export type Context = Awaited<ReturnType<typeof createContext>>;

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create({
	errorFormatter({ shape, error }) {
		return {
			...shape,
			data: {
				...shape.data,
				zodError:
					error.cause instanceof Error && error.cause.name === "ZodError"
						? error.cause
						: null,
			},
		};
	},
});

/**
 * Middleware for protected routes
 */
const isAuthenticated = t.middleware(({ ctx, next }) => {
	if (!ctx.token) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "You must be logged in to access this resource",
		});
	}
	return next({
		ctx: {
			token: ctx.token,
		},
	});
});

/**
 * Middleware for owner-only routes
 */
const isOwner = t.middleware(({ ctx, next }) => {
	if (!ctx.token) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	if (ctx.token.role !== "OWNER") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Only owners can access this resource",
		});
	}

	return next({
		ctx: {
			token: ctx.token,
		},
	});
});

/**
 * Middleware for cashier-only routes
 */
const isCashier = t.middleware(({ ctx, next }) => {
	if (!ctx.token) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	if (ctx.token.employeeRole !== "CASHIER") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Only cashiers can access this resource",
		});
	}

	return next({
		ctx: {
			token: ctx.token,
		},
	});
});

// Export reusable router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthenticated);
export const ownerProcedure = t.procedure.use(isOwner);
export const cashierProcedure = t.procedure.use(isCashier);
