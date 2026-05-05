import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useGetAllPurchaseOrdersQuery } from "@/controllers/purchase-order/query";
import type { TFormProps } from "@/types/form-props";
import type { TStockBatchCreateSchema } from "@repo/contracts/stock-batch";
import { useEffect, useState } from "react";
import { useFieldArray, useWatch } from "react-hook-form";
import SearchableSelect, {
  SearchableSelectContent,
  SearchableSelectInput,
  SearchableSelectItem,
  SearchableSelectList,
  SearchableSelectTrigger,
  SearchableSelectVacuum,
} from "../searchable-select";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Hash,
  Calendar,
  Building2,
  Info,
  ChevronRight,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useDebounce } from "@/hooks/use-debounce";

export default function StockBatchCreateForm({
  form,
  onSubmit,
}: TFormProps<TStockBatchCreateSchema>) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  const { data: purchaseOrders, isLoading } = useGetAllPurchaseOrdersQuery({
    query: debouncedQuery,
    page: 1,
    limit: 50, // Increased limit for better selection
    status: "ordered",
  });
  const poDataList = purchaseOrders?.data.data?.list ?? [];
  const poId = useWatch({ control: form.control, name: "purchaseOrderId" });
  const selectedPurchaseOrder = poDataList.find((po) => po.id === poId);

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "purchaseItems",
  });

  useEffect(() => {
    if (selectedPurchaseOrder) {
      const items = selectedPurchaseOrder.items.map((item) => ({
        purchaseItemId: item.id,
        quantityReceived: item.quantity,
      }));
      replace(items);
    } else {
      replace([]);
    }
  }, [selectedPurchaseOrder, replace]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-muted/10 p-4 rounded-2xl border border-border/50">
          <FormField
            control={form.control}
            name="batchNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest mb-2 flex items-center gap-2">
                  <Hash className="h-3 w-3" />
                  Batch Number
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="BATCH-001"
                    className="h-11 bg-background border-border/60 focus:bg-background transition-all font-mono font-bold text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="arrivalDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest mb-2 flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Arrival Date
                </FormLabel>
                <FormControl>
                  {/**@ts-ignore */}
                  <Input
                    type="date"
                    className="h-11 bg-background border-border/60 focus:bg-background transition-all font-bold text-sm cursor-pointer"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="purchaseOrderId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest mb-2 flex items-center gap-2">
                <Receipt className="h-3 w-3" />
                PO Reference
              </FormLabel>
              <FormControl>
                <SearchableSelect
                  query={query}
                  onQueryChange={setQuery}
                  onValueChange={(val) => field.onChange(Number(val))}
                  isLoading={isLoading}
                >
                  <SearchableSelectTrigger asChild>
                    <Button
                      type="button"
                      className="w-full justify-between h-14 px-4 bg-muted/20 hover:bg-muted/30 border-dashed border-2 hover:border-primary/50 transition-all duration-300"
                      variant={"outline"}
                    >
                      {selectedPurchaseOrder ? (
                        <div className="flex items-center gap-3 text-left">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Receipt className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold tracking-tight">
                              {selectedPurchaseOrder.invoiceId}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase font-medium flex items-center gap-1">
                              <Building2 className="h-2.5 w-2.5" />
                              {selectedPurchaseOrder.vendor.name}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-muted-foreground/60">
                          <div className="h-9 w-9 rounded-full bg-muted/40 flex items-center justify-center border border-dashed border-muted-foreground/20">
                            <Receipt className="h-5 w-5" />
                          </div>
                          <span className="font-medium">
                            Select Purchase Order Reference
                          </span>
                        </div>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30" />
                    </Button>
                  </SearchableSelectTrigger>
                  <SearchableSelectContent className="">
                    <SearchableSelectInput placeholder="Search invoice or vendor..." />
                    <SearchableSelectList className="max-h-[300px] custom-scrollbar">
                      <SearchableSelectVacuum listLength={poDataList.length} />
                      {poDataList.map((po) => (
                        <SearchableSelectItem
                          key={po.id}
                          value={po.id.toString()}
                          className="py-3 px-3 cursor-pointer"
                        >
                          <div className="flex flex-col gap-1.5 w-full">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Receipt className="h-4 w-4 text-primary/70" />
                                <span className="font-bold text-sm">
                                  {po.invoiceId}
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-[9px] uppercase font-bold px-1.5 py-0 h-4 bg-primary/5 text-primary border-primary/20"
                              >
                                {po.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
                              <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3 opacity-60" />
                                {po.vendor.name}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 opacity-60" />
                                {new Date(po.orderDate).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                  },
                                )}
                              </div>
                            </div>
                          </div>
                        </SearchableSelectItem>
                      ))}
                    </SearchableSelectList>
                  </SearchableSelectContent>
                </SearchableSelect>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {fields.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-dashed animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold flex items-center gap-2 text-foreground/80">
                <Package className="h-4 w-4 text-primary" />
                Items to Receive
              </h3>
              <Badge
                variant="secondary"
                className="font-mono text-[10px] bg-primary/5 text-primary border-primary/10"
              >
                {fields.length} {fields.length === 1 ? "ITEM" : "ITEMS"}
              </Badge>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => {
                const poItem = selectedPurchaseOrder?.items.find(
                  (i) => i.id === field.purchaseItemId,
                );
                return (
                  <div
                    key={field.id}
                    className="group relative bg-muted/20 hover:bg-muted/40 transition-all duration-300 rounded-xl border border-border/40 p-4 flex flex-col gap-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center border border-border shadow-sm group-hover:border-primary/40 group-hover:shadow-md transition-all duration-300">
                          <Package className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold truncate">
                            {poItem?.product.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground/70 uppercase font-bold tracking-tight">
                            Prod ID: {poItem?.product.id}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-60">
                          Ordered
                        </span>
                        <Badge
                          variant="outline"
                          className="font-mono text-[11px] font-bold bg-background border-dashed"
                        >
                          {poItem?.quantity} Units
                        </Badge>
                      </div>
                    </div>

                    <Separator className="bg-border/40" />

                    <div className="flex items-end gap-4">
                      <FormField
                        control={form.control}
                        name={`purchaseItems.${index}.quantityReceived`}
                        render={({ field: inputField }) => (
                          <FormItem className="flex-1 space-y-2">
                            <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/80 flex items-center gap-2 tracking-widest">
                              <Hash className="h-3 w-3" />
                              Receiving Qty
                            </FormLabel>
                            <FormControl>
                              <div className="relative group/input">
                                <Input
                                  type="number"
                                  className="h-11 pr-24 bg-background/60 focus:bg-background transition-all border-border/60 focus:border-primary/50 font-mono font-bold text-base"
                                  {...inputField}
                                  onChange={(e) =>
                                    inputField.onChange(Number(e.target.value))
                                  }
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/40 flex items-center gap-1.5 pointer-events-none">
                                  / {poItem?.quantity} TOTAL
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage className="text-[10px] font-bold" />
                          </FormItem>
                        )}
                      />

                      <div className="pb-0.5 shrink-0">
                        {form.watch(
                          `purchaseItems.${index}.quantityReceived`,
                        ) === poItem?.quantity ? (
                          <div
                            className="h-11 w-11 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center animate-in zoom-in duration-300"
                            title="Full quantity receiving"
                          >
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                          </div>
                        ) : form.watch(
                            `purchaseItems.${index}.quantityReceived`,
                          ) > 0 &&
                          form.watch(
                            `purchaseItems.${index}.quantityReceived`,
                          ) < (poItem?.quantity ?? 0) ? (
                          <div
                            className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center animate-in zoom-in duration-300"
                            title="Partial quantity receiving"
                          >
                            <Info className="h-6 w-6 text-amber-500" />
                          </div>
                        ) : (
                          <div
                            className="h-11 w-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center animate-in zoom-in duration-300"
                            title="Invalid quantity"
                          >
                            <AlertCircle className="h-6 w-6 text-red-500" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full h-12 text-sm font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Receive Batch"
          )}
        </Button>
      </form>
    </Form>
  );
}
