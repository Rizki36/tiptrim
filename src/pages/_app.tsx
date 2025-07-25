import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { ReactElement, ReactNode } from "react";
import { useState } from "react";
import { Toaster } from "sonner";
import { trpc } from "../utils/trpc";

type LibAppProps = {
	session: Session | null;
};

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
	getLayout?: (page: ReactElement) => ReactNode;
};

export type AppPropsWithLayout = AppProps<LibAppProps> & {
	Component: NextPageWithLayout<LibAppProps>;
};

function App({ Component, pageProps }: AppPropsWithLayout) {
	const getLayout = Component.getLayout ?? ((page) => page);

	return (
		<SessionProvider session={pageProps.session}>
			<Toaster position="top-right" richColors />
			{getLayout(<Component {...pageProps} />)}
		</SessionProvider>
	);
}

export default trpc.withTRPC(App);
