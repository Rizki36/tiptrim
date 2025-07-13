import { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Eye, EyeOff, Save } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import OwnerLayout from "@/components/layouts/OwnerLayout";
import { NextPageWithLayout } from "@/pages/_app";
import { trpc } from "@/utils/trpc";

// Import shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { EmployeeRole } from "../../../../app/generated/prisma";

// Form validation schema
const employeeSchema = z
	.object({
		name: z
			.string()
			.min(3, "Nama minimal 3 karakter")
			.max(50, "Nama maksimal 50 karakter"),
		role: z.enum(EmployeeRole),
		username: z
			.string()
			.min(3, "Username minimal 3 karakter")
			.max(20, "Username maksimal 20 karakter")
			.regex(
				/^[a-zA-Z0-9_]+$/,
				"Username hanya boleh huruf, angka, dan underscore",
			),
		password: z
			.string()
			.min(6, "Password minimal 6 karakter")
			.max(50, "Password maksimal 50 karakter"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Konfirmasi password tidak cocok",
		path: ["confirmPassword"],
	});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

const AddEmployeePage: NextPageWithLayout = () => {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Setup form with validation
	const form = useForm<EmployeeFormValues>({
		resolver: zodResolver(employeeSchema),
		defaultValues: {
			role: "BARBER",
		},
	});

	// tRPC mutation for creating employee
	const createEmployee = trpc.employees.create.useMutation({});

	// Handle form submission
	const onSubmit = async (data: EmployeeFormValues) => {
		createEmployee.mutate(
			{
				name: data.name,
				role: data.role,
				username: data.username,
				password: data.password,
			},
			{
				onSuccess: () => {
					toast.success("Karyawan berhasil ditambahkan");
					router.push("/owner/karyawan");
				},
				onError: (error) => {
					toast.error(error.message || "Gagal menambahkan karyawan");
				},
			},
		);
	};

	return (
		<div className="mx-auto max-w-3xl">
			{/* Header with back button */}
			<div className="mb-6 flex items-center">
				<Button
					variant="ghost"
					size="icon"
					className="mr-4 rounded-full"
					asChild
				>
					<Link href="/owner/employees">
						<ArrowLeft size={20} />
					</Link>
				</Button>
				<h1 className="text-2xl font-bold">Tambah Karyawan Baru</h1>
			</div>

			{/* Form */}
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg font-medium">
								Informasi Karyawan
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Name field */}
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nama Lengkap</FormLabel>
										<FormControl>
											<Input placeholder="Masukkan nama lengkap" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Role field */}
							<FormField
								control={form.control}
								name="role"
								render={({ field }) => (
									<FormItem className="space-y-2">
										<FormLabel>Peran</FormLabel>
										<FormControl>
											<RadioGroup
												onValueChange={field.onChange}
												defaultValue={field.value}
												className="flex flex-wrap gap-4"
											>
												<div className="flex items-center space-x-2">
													<RadioGroupItem
														value="BARBER"
														id="barber"
														className="text-tiptrim-orange"
													/>
													<Label
														htmlFor="barber"
														className="cursor-pointer rounded-md border border-gray-200 px-4 py-2 hover:bg-gray-50 data-[state=checked]:border-tiptrim-orange data-[state=checked]:bg-tiptrim-orange/10"
													>
														Pemotong (Barber)
													</Label>
												</div>
												<div className="flex items-center space-x-2">
													<RadioGroupItem
														value="CASHIER"
														id="cashier"
														className="text-tiptrim-orange"
													/>
													<Label
														htmlFor="cashier"
														className="cursor-pointer rounded-md border border-gray-200 px-4 py-2 hover:bg-gray-50 data-[state=checked]:border-tiptrim-orange data-[state=checked]:bg-tiptrim-orange/10"
													>
														Kasir
													</Label>
												</div>
											</RadioGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-lg font-medium">Akun Login</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Username field */}
							<FormField
								control={form.control}
								name="username"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Username</FormLabel>
										<FormControl>
											<Input placeholder="Masukkan username" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Password field */}
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													type={showPassword ? "text" : "password"}
													placeholder="Masukkan password"
													{...field}
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="absolute right-2 top-1/2 -translate-y-1/2 px-2"
													onClick={() => setShowPassword(!showPassword)}
												>
													{showPassword ? (
														<EyeOff size={16} />
													) : (
														<Eye size={16} />
													)}
												</Button>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Confirm Password field */}
							<FormField
								control={form.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Konfirmasi Password</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													type={showConfirmPassword ? "text" : "password"}
													placeholder="Konfirmasi password"
													{...field}
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="absolute right-2 top-1/2 -translate-y-1/2 px-2"
													onClick={() =>
														setShowConfirmPassword(!showConfirmPassword)
													}
												>
													{showConfirmPassword ? (
														<EyeOff size={16} />
													) : (
														<Eye size={16} />
													)}
												</Button>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Form actions */}
					<div className="flex justify-end space-x-4">
						<Button variant="outline" asChild>
							<Link href="/owner/employees">Batal</Link>
						</Button>
						<Button
							type="submit"
							disabled={form.formState.isSubmitting || createEmployee.isPending}
							className="bg-tiptrim-orange hover:bg-tiptrim-orange/90"
						>
							<Save className="mr-2 h-4 w-4" />
							Simpan
							{(form.formState.isSubmitting || createEmployee.isPending) && (
								<span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
							)}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
};

AddEmployeePage.getLayout = (page) => {
	return <OwnerLayout>{page}</OwnerLayout>;
};

export default AddEmployeePage;
