import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AUDIT_ACTION } from "@repo/contracts/status";

export function ActionBadge({ action }: { action: AUDIT_ACTION }) {
  const classNames = {
    create: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    update: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    delete: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  } as Record<AUDIT_ACTION, string>;

  return (
    <Badge variant="outline" className={cn("capitalize", classNames[action])}>
      {action}
    </Badge>
  );
}
