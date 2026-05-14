import { useGetPermissionsQuery } from "@/controllers/main/query";
import type { Permission } from "@repo/contracts/permission";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";

export default function PermissionChecker({
  children,
  requiredPermissions,
  className,
}: {
  children: React.ReactNode;
  requiredPermissions: Permission[];
  className?: string;
}) {
  const { data, isLoading, isError } = useGetPermissionsQuery();
  const permissons = data?.data.data || [];
  const hasPermission = requiredPermissions.every((permission) =>
    permissons.includes(permission),
  );

  if (isLoading) return <Skeleton className={cn("h-9 w-24", className)} />;

  if (isError) return null;

  return hasPermission ? children : null;
}
