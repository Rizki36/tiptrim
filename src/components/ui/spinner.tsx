import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
	className?: string;
	size?: number;
}

export function Spinner({ className, size = 24 }: SpinnerProps) {
	return (
		<div className="flex flex-col items-center justify-center">
			<Loader2
				className={cn("animate-spin text-tiptrim-orange", className)}
				size={size}
			/>
			<span className="mt-2 text-sm text-gray-500">Loading...</span>
		</div>
	);
}
