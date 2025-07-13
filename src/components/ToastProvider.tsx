import { useRouter } from "next/router";
import { useEffect } from "react";
import { Toaster, toast } from "sonner";

export function ToastProvider() {
	const router = useRouter();

	useEffect(() => {
		// Check for toast message in URL
		const { toast: toastMessage } = router.query;

		if (toastMessage) {
			// Show different toast messages based on the parameter
			switch (toastMessage) {
				case "unauthorized-owner":
					toast.error("You don't have permission to access owner pages", {
						id: "unauthorized-owner",
					});
					break;
				case "unauthorized-cashier":
					toast.error("You don't have permission to access cashier pages", {
						id: "unauthorized-cashier",
					});
					break;
				case "unauthorized-role":
					toast.error("You don't have the required role to access this page", {
						id: "unauthorized-role",
					});
					break;
			}

			// Remove the toast parameter from URL
			const { pathname, query } = router;
			const params = new URLSearchParams(query as Record<string, string>);
			params.delete("toast");

			// Replace URL without toast parameter (to prevent showing toast on refresh)
			const newQuery = params.toString();
			router.replace(
				{
					pathname,
					query: newQuery ? `?${newQuery}` : "",
				},
				undefined,
				{ shallow: true },
			);
		}
	}, [router.query, router]);

	return <Toaster position="top-right" closeButton theme="system" richColors />;
}
