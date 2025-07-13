import { Toaster } from "@/components/ui/sonner";
import { Head, Html, Main, NextScript } from "next/document";

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
