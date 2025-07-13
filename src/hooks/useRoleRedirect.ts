import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export function useRoleRedirect() {
	const { data: session, status } = useSession();
	const router = useRouter();

	console.log("test", { status });

	useEffect(() => {
		if (status === "authenticated") {
			const userRole = session?.user?.role;
			const employeeRole = session?.user?.employeeRole;
			console.log({
				userRole,
				employeeRole,
			});

			// Define home pages based on role
			if (userRole === "OWNER" && router.pathname === "/login") {
				router.push("/owner/dashboard");
			} else if (
				userRole === "EMPLOYEE" &&
				employeeRole === "CASHIER" &&
				router.pathname === "/login"
			) {
				router.push("/cashier");
			} else if (
				userRole === "EMPLOYEE" &&
				employeeRole === "BARBER" &&
				router.pathname === "/login"
			) {
				// You might want to create a page for barbers if needed
				router.push("/barber");
			}
		} else if (status === "unauthenticated" && router.pathname !== "/login") {
			router.push("/login");
		}
	}, [status, session, router]);

	return { session, status };
}
