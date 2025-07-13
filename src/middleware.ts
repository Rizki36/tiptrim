import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default withAuth(
	async function middleware(req: NextRequest) {
		// Get the token the correct way
		const token = await getToken({ req });
		const pathname = req.nextUrl.pathname;

		// Define redirection paths based on role
		const ownerHome = "/owner/dashboard";
		const cashierHome = "/cashier";

		// Check if user is trying to access owner routes
		if (pathname.startsWith("/owner")) {
			if (token?.role !== "OWNER") {
				// Create a URL for redirection with a toast message parameter
				const redirectUrl = new URL(cashierHome, req.url);
				redirectUrl.searchParams.set("toast", "unauthorized-owner");
				return NextResponse.redirect(redirectUrl);
			}
		}

		// Check if user is trying to access cashier routes
		if (pathname.startsWith("/cashier")) {
			if (token?.role === "OWNER") {
				// Create a URL for redirection with a toast message parameter
				const redirectUrl = new URL(ownerHome, req.url);
				redirectUrl.searchParams.set("toast", "unauthorized-cashier");
				return NextResponse.redirect(redirectUrl);
			}

			if (token?.employeeRole !== "CASHIER") {
				// For employees who aren't cashiers
				const redirectUrl = new URL("/login", req.url);
				redirectUrl.searchParams.set("toast", "unauthorized-role");
				return NextResponse.redirect(redirectUrl);
			}
		}

		return NextResponse.next();
	},
	{
		callbacks: {
			authorized: ({ token }) => !!token,
		},
	},
);

// Configure which routes to apply middleware to
export const config = {
	matcher: ["/owner/:path*", "/cashier/:path*"],
};
