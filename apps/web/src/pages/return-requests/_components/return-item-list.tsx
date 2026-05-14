import type { TReturnRequest } from "@repo/contracts/circulation";
import { Package2, RotateCcw, Trash2, MessageSquare } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ReturnRequestItemList({
  request,
}: {
  request: TReturnRequest;
}) {
  const items = request.items;
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-input/50 bg-muted/20 transition-all duration-300 hover:bg-muted/30">
        <Package2 className="h-10 w-10 text-muted-foreground/40 mb-3 animate-pulse" />
        <p className="text-sm font-medium text-muted-foreground">
          No items in this return request
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-input/40 bg-background shadow-lg shadow-black/5 ring-1 ring-black/5 max-h-[calc(100vh-20rem)] overflow-y-auto">
      <Table>
        <TableHeader className="uppercase tracking-wider sticky top-0_z-10 bg-background/95 backdrop-blur-sm">
          <TableRow className="hover:bg-transparent border-b border-input/40">
            <TableHead className="px-4 py-3 h-12 text-xs font-semibold text-muted-foreground">
              <div className="flex items-center gap-2">
                <Package2 className="h-3.5 w-3.5" />
                Product
              </div>
            </TableHead>
            <TableHead className="px-4 py-3 h-12 text-xs font-semibold text-muted-foreground text-center">
              <div className="flex items-center gap-2 justify-center">
                <RotateCcw className="h-3.5 w-3.5" />
                Ret
              </div>
            </TableHead>
            <TableHead className="px-4 py-3 h-12 text-xs font-semibold text-muted-foreground text-center">
              <div className="flex items-center gap-2 justify-center">
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                Dmg
              </div>
            </TableHead>
            <TableHead className="px-4 py-3 h-12 text-xs font-semibold text-muted-foreground">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5" />
                Reason
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
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {item.product.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono opacity-60">
                    ID: {item.product.id}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-4 py-4 text-center">
                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold font-mono ring-1 ring-inset ring-primary/20">
                  {item.quantityReceived}
                </span>
              </TableCell>
              <TableCell className="px-4 py-4 text-center">
                {item.quantityDamaged ? (
                  <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-destructive/10 text-destructive text-xs font-bold font-mono ring-1 ring-inset ring-destructive/20">
                    {item.quantityDamaged}
                  </span>
                ) : (
                  <span className="text-muted-foreground/30 font-mono text-xs">
                    -
                  </span>
                )}
              </TableCell>
              <TableCell className="px-4 py-4">
                <span className="text-xs text-muted-foreground italic">
                  {item.reason || "N/A"}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
