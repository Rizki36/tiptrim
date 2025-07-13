import Image from "next/image";
import Link from "next/link";

interface EmployeeCardProps {
	id: string;
	name: string;
	role: "BARBER" | "CASHIER";
	imageUrl?: string;
}

export default function EmployeeCard({
	id,
	name,
	role,
	imageUrl = "/placeholder-avatar.png",
}: EmployeeCardProps) {
	return (
		<Link
			href={`/owner/karyawan/${id}`}
			className="block overflow-hidden rounded-lg bg-tiptrim-gray p-4 transition-shadow hover:shadow-md"
		>
			<div className="flex items-center gap-4">
				<div className="h-16 w-16 overflow-hidden rounded-full">
					<Image
						src={imageUrl}
						alt={name}
						width={64}
						height={64}
						className="h-full w-full object-cover"
					/>
				</div>
				<div>
					<h3 className="font-medium">{name}</h3>
					<p className="mt-1 text-gray-600">
						{role === "BARBER" ? "Pemotong" : "Kasir"}
					</p>
				</div>
			</div>
		</Link>
	);
}
