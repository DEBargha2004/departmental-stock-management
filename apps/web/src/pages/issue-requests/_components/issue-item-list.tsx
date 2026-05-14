import type { TIssueRequest } from "@repo/contracts/circulation";
import {
  Package2,
  Hash,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  Ban,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getIssueRequestReturnStatusObject,
  ISSUE_REQUEST_RETURN_STATUS,
} from "@repo/contracts/status";

function IssueItemStatusIndicator({
  status,
}: {
  status: ISSUE_REQUEST_RETURN_STATUS;
}) {
  const config = {
    [ISSUE_REQUEST_RETURN_STATUS.PENDING]: {
      label: getIssueRequestReturnStatusObject("pending").label,
      icon: Clock,
      className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      iconClassName: "text-amber-500",
    },
    [ISSUE_REQUEST_RETURN_STATUS.RETURNED]: {
      label: getIssueRequestReturnStatusObject("returned").label,
      icon: CheckCircle2,
      className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      iconClassName: "text-emerald-500",
    },
    [ISSUE_REQUEST_RETURN_STATUS.PARTIALLY_RETURNED]: {
      label: getIssueRequestReturnStatusObject("partially_returned").label,
      icon: AlertCircle,
      className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      iconClassName: "text-blue-500",
    },
    [ISSUE_REQUEST_RETURN_STATUS.NON_RETURNABLE]: {
      label: getIssueRequestReturnStatusObject("non_returnable").label,
      icon: Ban,
      className: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
      iconClassName: "text-zinc-500",
    },
  };

  const {
    label,
    icon: Icon,
    className,
    iconClassName,
  } = config[status] || config[ISSUE_REQUEST_RETURN_STATUS.PENDING];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all duration-300",
        className,
      )}
    >
      <Icon className={cn("h-3 w-3", iconClassName)} />
      {label}
    </div>
  );
}

export default function IssueRequestItemList({
  request,
}: {
  request: TIssueRequest;
}) {
  const items = request.items;
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-input/50 bg-muted/20 transition-all duration-300 hover:bg-muted/30">
        <Package2 className="h-10 w-10 text-muted-foreground/40 mb-3 animate-pulse" />
        <p className="text-sm font-medium text-muted-foreground">
          No items in this issue request
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-y-6 gap-x-8 p-6 rounded-2xl border border-input/40 bg-muted/10 relative overflow-hidden">
        <div className="flex flex-col gap-1.5 relative z-10">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
            <Calendar className="h-3.5 w-3.5 text-primary/60" />
            Issue Date
          </div>
          <span className="text-sm font-semibold text-foreground tracking-tight">
            {formatDate(request.issueDate)}
          </span>
        </div>

        <div className="flex flex-col gap-1.5 relative z-10">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
            <Package2 className="h-3.5 w-3.5 text-primary/60" />
            Items Count
          </div>
          <span className="text-sm font-semibold text-foreground tracking-tight">
            {items.length} {items.length === 1 ? "Product" : "Products"}
          </span>
        </div>

        <div className="flex flex-col gap-1.5 relative z-10 col-span-1">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
            <User className="h-3.5 w-3.5 text-primary/60" />
            Issued To
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground tracking-tight">
              {request.issuedTo.name}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              {request.issuedTo.email}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 relative z-10 col-span-1">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary/60" />
            Issued By
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground tracking-tight">
              {request.issuedBy.name}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium text-primary/70 uppercase tracking-wider">
              {request.issuedBy.role}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-input/40 bg-background shadow-lg shadow-black/5 ring-1 ring-black/5 max-h-[calc(100vh-20rem)] overflow-y-auto">
        <Table>
          <TableHeader className="uppercase tracking-wider sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
            <TableRow className="hover:bg-transparent border-b border-input/40">
              <TableHead className="px-4 py-3 h-12 text-xs font-semibold text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Package2 className="h-3.5 w-3.5" />
                  Product
                </div>
              </TableHead>
              <TableHead className="px-4 py-3 h-12 text-xs font-semibold text-muted-foreground text-center">
                <div className="flex items-center gap-2 justify-center">
                  <Hash className="h-3.5 w-3.5" />
                  Qty
                </div>
              </TableHead>
              <TableHead className="px-4 py-3 h-12 text-xs font-semibold text-muted-foreground text-center">
                <div className="flex items-center gap-2 justify-center">
                  <Hash className="h-3.5 w-3.5" />
                  Status
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.id}
                className="group border-input/20 hover:bg-muted/30 transition-all duration-200"
              >
                <TableCell className="px-4 py-4">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {item.product.name}
                      </span>
                      {item.isConsumable && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-100 text-zinc-500 border border-zinc-200 uppercase tracking-tighter">
                          Consumable
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono opacity-60">
                      ID: {item.product.id}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 text-center">
                  <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-muted/60 text-xs font-bold font-mono ring-1 ring-inset ring-input/20">
                    {item.quantity}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-4 text-center">
                  <IssueItemStatusIndicator status={item.returnStatus} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
