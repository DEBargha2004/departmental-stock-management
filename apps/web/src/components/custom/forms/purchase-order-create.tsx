import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  CalendarIcon,
  Loader2,
  Building2,
  Receipt,
  Package,
  IndianRupee,
  ShoppingCart,
  ChevronRight,
  Hash,
  Tag,
  Box,
} from "lucide-react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import type { TFormProps } from "@/types/form-props";
import type { TPurchaseOrderCreateSchema } from "@repo/contracts/purchase-order";
import { useGetAllVendorsQuery } from "@/controllers/vendor/query";
import { useGetAllItemsQuery } from "@/controllers/product/query";
import { useEffect, useRef, useState } from "react";
import SearchableSelect, {
  SearchableSelectContent,
  SearchableSelectInput,
  SearchableSelectItem,
  SearchableSelectList,
  SearchableSelectTrigger,
  SearchableSelectVacuum,
} from "../searchable-select";
import type { TProduct } from "@/controllers/product/api";
import { getDefaultPurchaseOrderItemValues } from "@/constants/form-defaults/purchase-order";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import type { TVendor } from "@/controllers/vendor/api";
import { useDebounce } from "@/hooks/use-debounce";

export default function CreatePurchaseOrderForm({
  form,
  onSubmit,
  defaultList,
}: TFormProps<TPurchaseOrderCreateSchema> & {
  defaultList?: {
    vendors?: TVendor[];
    products?: TProduct[];
  };
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const [query, setQuery] = useState({
    vendors: "",
    products: "",
  });

  const debouncedVendorsQuery = useDebounce(query.vendors, 500);

  const { data: vendorsData, isLoading: isLoadingVendors } =
    useGetAllVendorsQuery({
      limit: 100,
      page: 1,
      status: "active",
      query: debouncedVendorsQuery,
    });

  const vendors = vendorsData?.data?.data?.list || [];

  const selectedVendorId = useWatch({
    control: form.control,
    name: "vendorId",
  });

  const selectedVendor = vendors.find((v) => v.id === selectedVendorId);
  const items = useWatch({
    control: form.control,
    name: "items",
  });

  const handleDeleteItem = (index: number) => {
    remove(index);
    if (items.length === 1) {
      append(getDefaultPurchaseOrderItemValues());
    }
  };

  const calculateTotal = () => {
    const total = items.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
      0,
    );

    form.setValue("totalAmount", total);
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Header Metadata Grid */}
        <div className="grid grid-cols-1 gap-5 bg-muted/10 p-5 rounded-2xl border border-border/50">
          <FormField
            control={form.control}
            name="vendorId"
            render={({ field }) => (
              <FormItem className="md:col-span-1">
                <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest mb-2 flex items-center gap-2">
                  <Building2 className="h-3 w-3" />
                  Vendor
                </FormLabel>
                <FormControl>
                  <SearchableSelect
                    query={query.vendors}
                    onQueryChange={(q) =>
                      setQuery((prev) => ({ ...prev, vendors: q }))
                    }
                    onValueChange={(val) => field.onChange(Number(val))}
                    isLoading={isLoadingVendors}
                  >
                    <SearchableSelectTrigger asChild>
                      <Button
                        type="button"
                        className="w-full justify-between h-11 px-3 bg-background hover:bg-muted/50 border-border/60 transition-all duration-200"
                        variant={"outline"}
                      >
                        {selectedVendor ? (
                          <div className="flex items-center gap-2.5 text-left min-w-0">
                            <Building2 className="h-4 w-4 text-primary shrink-0" />
                            <div className="flex flex-col items-start min-w-0">
                              <span className="font-bold text-sm truncate">
                                {selectedVendor.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground/60 font-bold">
                                {selectedVendor.contactPerson}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 text-xs">
                            Select Vendor
                          </span>
                        )}
                        <ChevronRight className="h-4 w-4 opacity-30" />
                      </Button>
                    </SearchableSelectTrigger>
                    <SearchableSelectContent>
                      <SearchableSelectInput placeholder="Search vendors..." />
                      <SearchableSelectList className="max-h-[250px] custom-scrollbar">
                        <SearchableSelectVacuum listLength={vendors.length} />
                        {vendors.map((vendor) => (
                          <SearchableSelectItem
                            key={vendor.id}
                            value={vendor.id.toString()}
                            className="py-3 px-4"
                          >
                            <div className="flex items-center justify-between w-full gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                  {vendor.name.charAt(0)}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                                    {vendor.name}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground/70 uppercase font-bold tracking-tight">
                                    {vendor.contactPerson}
                                  </span>
                                </div>
                              </div>
                              <div className="shrink-0 text-right">
                                <div className="text-[10px] font-mono font-bold text-muted-foreground/80">
                                  {vendor.phone}
                                </div>
                                {vendor.email && (
                                  <div className="text-[9px] text-muted-foreground/50 lowercase truncate max-w-[120px]">
                                    {vendor.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </SearchableSelectItem>
                        ))}
                      </SearchableSelectList>
                    </SearchableSelectContent>
                  </SearchableSelect>
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-muted/10 p-5 rounded-2xl border border-border/50">
          <FormField
            control={form.control}
            name="invoiceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest mb-2 flex items-center gap-2">
                  <Receipt className="h-3 w-3" />
                  Invoice ID
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="INV-XXXX"
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
            name="orderDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest mb-2 flex items-center gap-2">
                  <CalendarIcon className="h-3 w-3" />
                  Order Date
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

        {/* Order Items Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground/80">
                Order Items
              </h3>
              <Badge variant="secondary" className="font-mono text-[10px] h-5">
                {fields.length}
              </Badge>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append(getDefaultPurchaseOrderItemValues())}
              className="h-8 px-3 gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-3 custom-scrollbar -mr-3">
            {fields.map((field, index) => (
              <ProductSelect
                key={field.id}
                index={index}
                handleDeleteItem={handleDeleteItem}
                calculateTotal={calculateTotal}
                defaultList={defaultList?.products ?? []}
              />
            ))}
          </div>

          {/* Grand Total Bar */}
          <div className="flex justify-end pt-2">
            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="bg-primary px-6 py-3 rounded-xl flex items-center gap-6 shadow-lg shadow-primary/20 ring-4 ring-primary/10">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-primary-foreground/60 uppercase tracking-[0.2em]">
                          Total Amount
                        </span>
                        <div className="flex items-center gap-1.5 text-primary-foreground font-black text-2xl tracking-tighter tabular-nums">
                          <IndianRupee className="h-5 w-5 opacity-70 shrink-0" />
                          <Input
                            type="number"
                            step="0.01"
                            className="bg-transparent border-none p-0 h-auto text-primary-foreground font-black text-2xl tracking-tighter tabular-nums focus-visible:ring-0 w-32 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            {...field}
                            onChange={field.onChange}
                          />
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-14 text-base font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 group rounded-2xl"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <div className="flex items-center gap-3">
              <span>Create Purchase Order</span>
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </Button>
      </form>
    </Form>
  );
}

function ProductSelect({
  index,
  defaultList,
  handleDeleteItem,
  calculateTotal,
}: {
  index: number;
  defaultList?: TProduct[];
  handleDeleteItem: (index: number) => void;
  calculateTotal: () => void;
}) {
  const { control, setValue } = useFormContext<TPurchaseOrderCreateSchema>();
  const [query, setQuery] = useState("");
  const { data: products, isLoading: isLoadingProducts } = useGetAllItemsQuery({
    limit: 500,
    page: 1,
    query: query,
  });
  const firstRenderRef = useRef(true);

  const dataList = query
    ? products?.data.data?.list
    : defaultList?.length
      ? defaultList
      : products?.data.data?.list;

  const getProduct = (id: number) => {
    const d = dataList?.find((p) => p.id === Number(id));

    return d;
  };

  const item = useWatch({
    control,
    name: `items.${index}`,
  });

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    calculateTotal();
  }, [item.quantity, item.unitPrice]);

  const subtotal = (item.quantity || 0) * (item.unitPrice || 0);

  return (
    <div className="group relative bg-background hover:bg-muted/10 transition-all duration-300 rounded-2xl border border-border/60 p-5 shadow-sm hover:shadow-md space-y-5">
      {/* Product Selection Line */}
      <div className="flex items-start justify-between gap-4">
        <FormField
          control={control}
          name={`items.${index}.itemId`}
          render={({ field }) => (
            <FormItem className="flex-1 min-w-0">
              <FormLabel className="text-[9px] uppercase font-black text-muted-foreground/60 tracking-widest mb-1.5 flex items-center gap-2">
                <Box className="h-3 w-3" />
                Product
              </FormLabel>
              <FormControl>
                <SearchableSelect
                  query={query}
                  onQueryChange={setQuery}
                  onValueChange={(val) => {
                    field.onChange(Number(val));
                    const prod = getProduct(Number(val));
                    if (prod) {
                      setValue(`items.${index}.unitPrice`, prod.price);
                    }
                  }}
                  isLoading={isLoadingProducts}
                >
                  <SearchableSelectTrigger asChild>
                    <Button
                      type="button"
                      className="w-full justify-between h-11 px-3 bg-muted/20 border-transparent hover:border-primary/30 transition-all"
                      variant={"outline"}
                    >
                      {getProduct(field.value) ? (
                        <div className="flex items-center gap-2.5 text-left min-w-0">
                          <Package className="h-4 w-4 text-primary shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold truncate">
                              {getProduct(field.value)?.name}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50 text-xs">
                          Select Product...
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 opacity-20 shrink-0" />
                    </Button>
                  </SearchableSelectTrigger>
                  <SearchableSelectContent className="w-[350px]">
                    <SearchableSelectInput placeholder="Search items..." />
                    <SearchableSelectList className="max-h-[280px] custom-scrollbar">
                      <SearchableSelectVacuum
                        listLength={dataList?.length ?? 0}
                      />
                      {dataList?.map((product) => (
                        <SearchableSelectItem
                          key={product.id}
                          value={product.id.toString()}
                          className="py-2.5"
                        >
                          <div className="flex items-center justify-between w-full gap-3">
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-sm truncate">
                                {product.name}
                              </span>
                              <span className="text-[9px] text-muted-foreground uppercase font-bold">
                                {product.category.name}
                              </span>
                            </div>
                            <div className="shrink-0 text-right">
                              <div className="text-[10px] font-mono font-bold text-primary">
                                ₹{product.price}
                              </div>
                              <div className="text-[8px] text-muted-foreground uppercase">
                                Stock: {product.stock.quantity}
                              </div>
                            </div>
                          </div>
                        </SearchableSelectItem>
                      ))}
                    </SearchableSelectList>
                  </SearchableSelectContent>
                </SearchableSelect>
              </FormControl>
              <FormMessage className="text-[9px]" />
            </FormItem>
          )}
        />
        <div className="pt-7 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteItem(index)}
            className="h-10 w-10 rounded-xl text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator className="bg-border/40" />

      {/* Inputs Lines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField
          control={control}
          name={`items.${index}.quantity`}
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-[9px] uppercase font-black text-muted-foreground/60 tracking-widest flex items-center gap-2">
                <Hash className="h-3 w-3" />
                Quantity
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  className="h-11 bg-muted/20 border-transparent focus:bg-background focus:border-primary/30 font-mono font-bold text-sm"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage className="text-[9px]" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`items.${index}.unitPrice`}
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-[9px] uppercase font-black text-muted-foreground/60 tracking-widest flex items-center gap-2">
                <IndianRupee className="h-3 w-3" />
                Unit Price
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 font-black text-[10px]">
                    ₹
                  </span>
                  <Input
                    type="number"
                    className="h-11 pl-7 bg-muted/20 border-transparent focus:bg-background focus:border-primary/30 font-mono font-bold text-sm"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-[9px]" />
            </FormItem>
          )}
        />
      </div>

      {/* Subtotal Line */}
      <div className="pt-2">
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex items-center justify-between">
          <span className="text-[9px] uppercase font-black text-primary/60 tracking-widest flex items-center gap-2">
            <Tag className="h-3 w-3" />
            Item Subtotal
          </span>
          <div className="font-mono font-black text-primary text-sm tabular-nums">
            ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
}
