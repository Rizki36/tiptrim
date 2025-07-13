import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Spinner } from "../ui/spinner";
import { Menu, X } from "lucide-react";

export default function OwnerLayout({ children }: { children: ReactNode }) {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const menuItems = [
		{ label: "Dashboard", href: "/owner/dashboard" },
		{ label: "Karyawan", href: "/owner/karyawan" },
		{ label: "Penggajian", href: "/owner/penggajian" },
	];

	const isActive = (path: string) => {
		return router.asPath.startsWith(path);
	};

	// Toggle mobile menu
	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	// Close mobile menu when route changes
	useEffect(() => {
		setIsMobileMenuOpen(false);
	}, []);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		} else if (status === "authenticated" && session?.user?.role !== "OWNER") {
			// This is a fallback in case middleware doesn't work
			router.push("/cashier");
		}
	}, [session, status, router]);

	// Show loading state while checking authentication
	if (status === "loading" || !session) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Spinner size={32} />
			</div>
		);
	}

	return (
		<div className="flex min-h-screen bg-white">
			{/* Mobile menu toggle */}
			<div className="fixed left-0 top-0 z-40 block p-4 lg:hidden">
				<button
					type="button"
					onClick={toggleMobileMenu}
					className="rounded-md bg-tiptrim-orange p-2 text-white"
					aria-label="Toggle menu"
				>
					{isMobileMenuOpen ? (
						<X className="h-6 w-6" />
					) : (
						<Menu className="h-6 w-6" />
					)}
				</button>
			</div>

			{/* Sidebar - hidden on mobile unless toggled */}
			<div
				className={`fixed bottom-0 top-0 z-30 w-60 transform bg-tiptrim-orange md:rounded-r-lg transition-transform duration-300 ease-in-out lg:translate-x-0 ${
					isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex h-full flex-col p-4 md:pr-0">
					{/* Logo */}
					<div className="flex items-center justify-center py-4">
						<div className="rounded-md bg-white p-2 px-4">
							<span className="text-lg font-bold text-black">
								Tip<span className="text-tiptrim-orange">Trim</span>
							</span>
						</div>
					</div>

					{/* Navigation */}
					<nav className="mt-8 flex-grow space-y-1">
						{menuItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className={`flex items-center rounded-md md:rounded-r-none px-4 py-3 text-sm font-medium ${
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
					<div className="mt-auto pb-4 md:mr-4">
						<button
							type="button"
							onClick={() => signOut({ callbackUrl: "/login" })}
							className="w-full rounded-md bg-white py-3 text-center text-sm font-medium text-tiptrim-orange hover:bg-gray-100"
						>
							Keluar
						</button>
					</div>
				</div>
			</div>

			{/* Overlay for mobile when menu is open */}
			{isMobileMenuOpen && (
				<button
					type="button"
					className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
					onClick={() => setIsMobileMenuOpen(false)}
					aria-label="Close menu"
				></button>
			)}

			{/* Main Content */}
			<div className="w-full lg:ml-60">
				<main className="min-h-screen px-4 py-8 lg:p-8">{children}</main>
			</div>
		</div>
	);
}
