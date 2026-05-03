import { Badge } from "@/components/ui/badge";
import type { AUDIT_STATUS } from "@repo/contracts/status";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: AUDIT_STATUS }) {
  const classNames = {
    success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    failure: "bg-destructive/10 text-destructive border-destructive/20",
  } as Record<AUDIT_STATUS, string>;

  return (
    <Badge variant="outline" className={cn("capitalize", classNames[status])}>
      {status}
    </Badge>
  );
}
