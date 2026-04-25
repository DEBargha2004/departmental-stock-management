import {
  getPurchaseOrderStatusObject,
  type PURCHASE_ORDER_STATUS,
} from "@repo/contracts/status";
import { cn } from "@/lib/utils";

export function POStatusBadge({ status }: { status: PURCHASE_ORDER_STATUS }) {
  const className = {
    ordered: "bg-blue-100 text-blue-800 border-blue-200",
    received: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    partially_received: "bg-yellow-100 text-yellow-800 border-yellow-200",
  } as Record<PURCHASE_ORDER_STATUS, string>;

  return (
    <div
      className={cn(
        "px-2.5 py-0.5 rounded-full text-[11px] font-semibold border w-fit",
        className[status],
      )}
    >
      {getPurchaseOrderStatusObject(status).label}{" "}
    </div>
  );
}
