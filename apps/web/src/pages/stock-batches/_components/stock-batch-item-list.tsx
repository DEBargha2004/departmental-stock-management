import type { TStockBatch } from "@/controllers/stock-batch/api";
import { Package2, Hash, IndianRupee, Calculator, Calendar, Receipt, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export default function StockBatchItemList({ batch }: { batch: TStockBatch }) {
  const items = batch.items;

  return (
    <div className="space-y-6">
      {/* Batch Meta Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border border-input/40 bg-muted/20">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
            <Receipt className="h-3 w-3" />
            PO Reference
          </span>
          <span className="text-sm font-medium">{batch.purchaseOrder.invoiceId}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
            <User className="h-3 w-3" />
            Vendor
          </span>
          <span className="text-sm font-medium">{batch.vendor.name}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            Arrival Date
          </span>
          <span className="text-sm font-medium">
            {formatDate(batch.arrivalDate, { dateStyle: "medium" })}
          </span>
        </div>
      </div>

      {!items || items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-input/50 bg-muted/20 transition-all duration-300 hover:bg-muted/30">
          <Package2 className="h-10 w-10 text-muted-foreground/40 mb-3 animate-pulse" />
          <p className="text-sm font-medium text-muted-foreground">
            No items in this stock batch
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-input/40 bg-background shadow-lg shadow-black/5 ring-1 ring-black/5 max-h-[400px] overflow-y-auto">
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
                <TableHead className="px-4 py-3 h-12 text-xs font-semibold text-muted-foreground text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <IndianRupee className="h-3.5 w-3.5" />
                    Unit Price
                  </div>
                </TableHead>
                <TableHead className="px-4 py-3 h-12 text-xs font-semibold text-muted-foreground text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <Calculator className="h-3.5 w-3.5" />
                    Total
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
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-muted/60 text-xs font-bold font-mono ring-1 ring-inset ring-input/20">
                      {item.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-right text-sm font-medium text-muted-foreground/80 tabular-nums">
                    ₹
                    {item.unitPrice.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-right text-sm font-bold text-foreground tabular-nums">
                    ₹
                    {(item.quantity * item.unitPrice).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="border-t border-input/40 sticky bottom-0 z-10 bg-background/95 backdrop-blur-sm">
              <TableRow className="hover:bg-transparent border-b">
                <TableCell
                  colSpan={3}
                  className="px-4 py-4 text-sm font-bold text-muted-foreground text-right uppercase tracking-wider"
                >
                  Batch Value Total
                </TableCell>
                <TableCell className="px-4 py-4 text-base font-black text-primary text-right bg-primary/5 tabular-nums underline decoration-primary/20 underline-offset-4">
                  ₹
                  {items
                    .reduce((acc, item) => acc + item.quantity * item.unitPrice, 0)
                    .toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}
    </div>
  );
}
