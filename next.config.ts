import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	reactStrictMode: true,

	async redirects() {
		return [
			{
				source: "/owner",
				destination: "/owner/dashboard",
				permanent: false,
			},
		];
	},

	// Add rewrites to handle English to Indonesian URLs
	async rewrites() {
		return [
			{
				source: "/owner/dashboard",
				destination: "/owner/dashboard",
			},
			{
				source: "/owner/karyawan",
				destination: "/owner/employees",
			},
			{
				source: "/owner/penggajian",
				destination: "/owner/payroll",
			},
		];
	},
};

export default nextConfig;
