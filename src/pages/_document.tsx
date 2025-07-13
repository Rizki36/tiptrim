import { Head, Html, Main, NextScript } from "next/document";
import { Toaster } from "@/components/ui/sonner";

export default function Document() {
	return (
		<Html lang="en">
			<Head />
			<body className="antialiased" data-theme="light">
				<Main />
				<NextScript />
				<Toaster />
			</body>
		</Html>
	);
}
