// biome-ignore lint/correctness/noUnusedImports: intentionally
import NextAuth from "next-auth";

declare module "next-auth" {
	interface User {
		id: string;
		username: string;
		role: "OWNER" | "EMPLOYEE";
		employeeId?: string;
		employeeRole?: "CASHIER" | "BARBER";
	}

	interface Session {
		user: {
			id: string;
			username: string;
			role: "OWNER" | "EMPLOYEE";
			employeeId?: string;
			employeeRole?: "CASHIER" | "BARBER";
		};
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		id: string;
		username: string;
		role: string;
		employeeId?: string;
		employeeRole?: string;
	}
}
