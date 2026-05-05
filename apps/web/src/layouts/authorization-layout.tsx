import Unauthorized from "@/components/custom/unauthorized";
import { useGetAccessListQuery } from "@/controllers/main/query";
import type { MODULE } from "@repo/contracts/module";
import { Loader2 } from "lucide-react";

export default function AuthorizationLayout({
  module,
  children,
}: {
  module: MODULE;
  children: React.ReactNode;
}) {
  const { data: accessList, isLoading } = useGetAccessListQuery();
  const dataList = accessList?.data?.data ?? [];
  const hasAccess = dataList.includes(module);

  if (isLoading) {
    return (
      <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <Loader2 className="h-6 w-6 text-primary animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Verifying permissions...
          </p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] animate-in zoom-in-95 duration-300">
        <Unauthorized />
      </div>
    );
  }

  return children;
}
