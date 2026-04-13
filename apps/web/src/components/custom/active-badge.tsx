import { cn } from "@/lib/utils";

export default function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <div
      className={cn(
        "px-3 py-1 rounded-full text-xs font-medium w-fit",
        isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </div>
  );
}
