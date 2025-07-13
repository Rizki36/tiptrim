import { compare } from "bcrypt";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "../../../../app/generated/prisma";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				username: { label: "Username", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.username || !credentials?.password) {
					return null;
				}

				const user = await prisma.user.findUnique({
					where: { username: credentials.username },
					include: {
						employee: true,
					},
				});

				if (!user) {
					throw new Error("User or password is incorrect");
				}

				const isPasswordValid = await compare(
					credentials.password,
					user.password,
				);

				if (!isPasswordValid) {
					throw new Error("User or password is incorrect");
				}

				return {
					id: user.id,
					username: user.username,
					role: user.role,
					employeeId: user.employeeId || undefined,
					employeeRole: user.employee?.role || undefined,
				};
			},
		}),
	],
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.username = user.username;
				token.role = user.role;
				token.employeeId = user.employeeId;
				token.employeeRole = user.employeeRole;
			}
			return token;
		},
		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id as string;
				session.user.username = token.username as string;
				session.user.role = token.role as "OWNER" | "EMPLOYEE";
				session.user.employeeId = token.employeeId as string | undefined;
				session.user.employeeRole = token.employeeRole as
					| "CASHIER"
					| "BARBER"
					| undefined;
			}
			return session;
		},
	},
	pages: {
		signIn: "/login",
		signOut: "/login",
		error: "/login",
	},
	debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
