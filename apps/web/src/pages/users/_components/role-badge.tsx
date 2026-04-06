import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Role } from "@repo/contracts/roles";

export default function RoleBadge({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-medium text-xs px-2 py-0.5 rounded-md bg-opacity-15",
        role === "admin"
          ? "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400"
          : role === "faculty"
            ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
            : "bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400",
      )}
    >
      {children}
    </Badge>
  );
}
