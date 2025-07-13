import { useState } from "react";
import Link from "next/link";
import { UserPlus, Search } from "lucide-react";
import OwnerLayout from "@/components/layouts/OwnerLayout";
import type { NextPageWithLayout } from "../_app";
import { trpc } from "@/utils/trpc";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Define employee role type for clarity
type EmployeeRole = "BARBER" | "CASHIER";

// Get initials from name for avatar fallback
const getInitials = (name: string): string => {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.substring(0, 2);
};

// Employee card component
const EmployeeCard = ({
	id,
	name,
	role,
	imageUrl = "/placeholder-avatar.png",
}: {
	id: string;
	name: string;
	role: EmployeeRole;
	imageUrl?: string;
}) => {
	// Translate role to Indonesian
	const roleText = role === "BARBER" ? "Pemotong" : "Kasir";

	return (
		<Link
			href={`/owner/employees/${id}`}
			className="block overflow-hidden rounded-lg bg-tiptrim-gray p-4 transition-shadow hover:shadow-md"
		>
			<div className="flex items-center gap-4">
				<Avatar className="h-16 w-16">
					<AvatarImage src={imageUrl} alt={name} className="object-cover" />
					<AvatarFallback className="bg-tiptrim-orange text-white">
						{getInitials(name)}
					</AvatarFallback>
				</Avatar>
				<div>
					<h3 className="font-medium">{name}</h3>
					<p className="mt-1 text-gray-600">{roleText}</p>
				</div>
			</div>
		</Link>
	);
};

const EmployeesPage: NextPageWithLayout = () => {
	// Fetch employees data using tRPC
	const {
		data: employees,
		isLoading,
		error,
	} = trpc.employees.getAll.useQuery();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Karyawan</h1>
				<Link
					href="/owner/karyawan/tambah"
					className="flex items-center gap-2 rounded-md bg-tiptrim-orange px-4 py-2 text-white hover:bg-tiptrim-orange-dark"
				>
					<UserPlus size={18} />
					<span>Tambah Karyawan</span>
				</Link>
			</div>

			{/* Employee grid */}
			{isLoading ? (
				<div className="flex justify-center py-12">
					<Spinner size={32} />
				</div>
			) : error ? (
				<div className="rounded-md bg-red-50 p-4 text-center text-red-500">
					Error loading employees. Please try again.
				</div>
			) : employees && employees.length > 0 ? (
				<div className="flex flex-wrap gap-4">
					{employees.map((employee) => (
						<div key={employee.id} className="w-full max-w-[260px] flex-grow">
							<EmployeeCard
								id={employee.id}
								name={employee.name}
								role={employee.role as EmployeeRole}
								imageUrl={
									// employee.imageUrl || // TODO: Replace with actual image URL logic
									"/placeholder-avatar.png"
								}
							/>
						</div>
					))}
				</div>
			) : (
				<div className="py-12 text-center text-gray-500">
					No employees found. Add one to get started.
				</div>
			)}
		</div>
	);
};

EmployeesPage.getLayout = (page) => {
	return <OwnerLayout>{page}</OwnerLayout>;
};

export default EmployeesPage;
