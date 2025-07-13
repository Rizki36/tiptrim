import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRoleRedirect } from "../hooks/useRoleRedirect";
import { toast } from "sonner";

// Define login schema with Zod
const loginSchema = z.object({
	username: z.string().min(1, "Username is required"),
	password: z.string().min(1, "Password is required"),
});

// Create type from schema
type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
	const { status } = useRoleRedirect();

	// Initialize form with Zod resolver
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	// Form submission handler
	const onSubmit = async (data: LoginFormValues) => {
		const result = await signIn("credentials", {
			redirect: false,
			username: data.username,
			password: data.password,
		});

		if (result?.error) {
			toast.error("Invalid username or password");
		}
		// Redirect will be handled by useRoleRedirect
	};

	// Don't show login page if already authenticated
	if (status === "authenticated") {
		return <div>Redirecting...</div>;
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-white">
			<div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
				<div className="text-center">
					<h2 className="text-3xl font-bold">
						<span className="text-black">Tip</span>
						<span className="text-tiptrim-orange">Trim</span>
					</h2>
					<p className="mt-2 text-gray-600">Sign in to your account</p>
				</div>

				<form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
					<div className="space-y-4">
						<div>
							<label
								htmlFor="username"
								className="block text-sm font-medium text-gray-700"
							>
								Username
							</label>
							<div className="mt-1">
								<input
									id="username"
									{...register("username")}
									type="text"
									className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-tiptrim-orange focus:outline-none focus:ring-tiptrim-orange"
									placeholder="Username"
								/>
								{errors.username && (
									<p className="mt-1 text-xs text-red-600">
										{errors.username.message}
									</p>
								)}
							</div>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700"
							>
								Password
							</label>
							<div className="mt-1">
								<input
									id="password"
									{...register("password")}
									type="password"
									className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-tiptrim-orange focus:outline-none focus:ring-tiptrim-orange"
									placeholder="Password"
								/>
								{errors.password && (
									<p className="mt-1 text-xs text-red-600">
										{errors.password.message}
									</p>
								)}
							</div>
						</div>
					</div>

					<div>
						<button
							type="submit"
							disabled={isSubmitting}
							className="group relative flex w-full justify-center rounded-md border border-transparent bg-tiptrim-orange px-4 py-2 text-sm font-medium text-white hover:bg-tiptrim-orange-dark focus:outline-none focus:ring-2 focus:ring-tiptrim-orange focus:ring-offset-2 disabled:bg-tiptrim-orange/70"
						>
							{isSubmitting ? "Signing in..." : "Sign in"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
