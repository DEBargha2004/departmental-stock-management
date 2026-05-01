import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type STOCK_BATCH_STATUS =
  | "PENDING"
  | "RECEIVED"
  | "INSPECTED"
  | "STORED"
  | "CANCELLED";

export const STOCK_BATCH_STATUS_FORMATTED: {
  id: STOCK_BATCH_STATUS;
  label: string;
}[] = [
  { id: "PENDING", label: "Pending" },
  { id: "RECEIVED", label: "Received" },
  { id: "INSPECTED", label: "Inspected" },
  { id: "STORED", label: "Stored" },
  { id: "CANCELLED", label: "Cancelled" },
];

interface StockBatchStatusBadgeProps {
  status: STOCK_BATCH_STATUS;
}

export function StockBatchStatusBadge({ status }: StockBatchStatusBadgeProps) {
  const variants: Record<
    STOCK_BATCH_STATUS,
    { className: string; label: string }
  > = {
    PENDING: {
      className:
        "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20",
      label: "Pending",
    },
    RECEIVED: {
      className:
        "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20",
      label: "Received",
    },
    INSPECTED: {
      className:
        "bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20",
      label: "Inspected",
    },
    STORED: {
      className:
        "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20",
      label: "Stored",
    },
    CANCELLED: {
      className:
        "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
      label: "Cancelled",
    },
  };

  const variant = variants[status] || variants.PENDING;

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium px-2.5 py-0.5 rounded-full transition-colors",
        variant.className,
      )}
    >
      {variant.label}
    </Badge>
  );
}
