import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import type { ReactNode } from "react";

export default function CashierLayout({ children }: { children: ReactNode }) {
	const router = useRouter();

	const menuItems = [
		{ label: "Dashboard", href: "/cashier" },
		{ label: "New Order", href: "/cashier/order" },
	];

	const isActive = (path: string) => {
		return router.pathname === path;
	};

	return (
		<div className="flex min-h-screen">
			{/* Sidebar */}
			<div className="fixed bottom-0 left-0 top-0 w-60 bg-tiptrim-orange">
				<div className="flex flex-col p-4">
					{/* Logo */}
					<div className="mb-12 px-3 py-4">
						<h1 className="text-2xl font-bold text-white">
							Tip<span className="font-normal">Trim</span>
						</h1>
					</div>

					{/* Navigation */}
					<nav className="flex flex-grow flex-col space-y-1">
						{menuItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className={`rounded-md px-4 py-2 text-sm font-medium ${
									isActive(item.href)
										? "bg-white text-tiptrim-orange"
										: "text-white hover:bg-white/10"
								}`}
							>
								{item.label}
							</Link>
						))}
					</nav>

					{/* Logout Button */}
					<div className="mt-auto">
						<button
							type="button"
							onClick={() => signOut({ callbackUrl: "/login" })}
							className="w-full rounded-md bg-white px-4 py-2 text-center text-sm font-medium text-tiptrim-orange hover:bg-gray-100"
						>
							Keluar
						</button>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="ml-60 flex-1 p-8">{children}</div>
		</div>
	);
}
