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
import { Plus, Trash2, CalendarIcon, Loader2 } from "lucide-react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import type { TFormProps } from "@/types/form-props";
import type { TPurchaseOrderCreateSchema } from "@repo/contracts/purchase-order";
import { useGetAllVendorsQuery } from "@/controllers/vendor/query";
import { useGetAllItemsQuery } from "@/controllers/product/query";
import { useState } from "react";
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

export default function CreatePurchaseOrderForm({
  form,
  onSubmit,
}: TFormProps<TPurchaseOrderCreateSchema>) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const itemsWatch = useWatch({
    control: form.control,
    name: "items",
  });

  const [query, setQuery] = useState({
    vendors: "",
    products: "",
  });

  const { data: vendorsData, isLoading: isLoadingVendors } =
    useGetAllVendorsQuery({
      limit: 100,
      page: 1,
      status: "active",
      query: query.vendors,
    });

  const { data: productsData, isLoading: isLoadingProducts } =
    useGetAllItemsQuery({
      limit: 500,
      page: 1,
      query: query.products,
    });

  const vendors = vendorsData?.data?.data?.list || [];
  const products = productsData?.data?.data?.list || [];

  const selectedVendorId = useWatch({
    control: form.control,
    name: "vendorId",
  });

  const selectedVendor = vendors.find((v) => v.id === selectedVendorId);

  const calculateTotal = () => {
    return (itemsWatch || []).reduce(
      (sum, item) => sum + (item.quantity * item.unitPrice || 0),
      0,
    );
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="vendorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor</FormLabel>
              <FormControl>
                <SearchableSelect
                  list={vendors}
                  query={query.vendors}
                  onQueryChange={(q) =>
                    setQuery((prev) => ({ ...prev, vendors: q }))
                  }
                  onValueChange={(val) => field.onChange(Number(val))}
                  isLoading={isLoadingVendors}
                >
                  <SearchableSelectTrigger>
                    <Button
                      type="button"
                      className="w-full justify-start"
                      variant={"outline"}
                    >
                      {selectedVendor ? selectedVendor.name : "Select vendor"}
                    </Button>
                  </SearchableSelectTrigger>
                  <SearchableSelectContent>
                    <SearchableSelectInput />
                    <SearchableSelectList>
                      <SearchableSelectVacuum />
                      {vendors.map((vendor) => (
                        <SearchableSelectItem value={vendor.id.toString()}>
                          {vendor.name}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="orderDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Date</FormLabel>
                <FormControl>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input type="date" className="pl-9" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="invoiceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b">
            <h3 className="text-sm font-medium">Order Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append(getDefaultPurchaseOrderItemValues())}
              className="h-8 gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {fields.map((field, index) => (
              <ProductSelect key={field.id} index={index} />
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <div className="bg-muted/30 px-4 py-2 rounded-lg border border-dashed flex items-center gap-4">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Amount:
              </span>
              <span className="text-lg font-bold text-foreground">
                ₹&nbsp;
                {calculateTotal().toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span>Submit</span>
          )}
        </Button>
      </form>
    </Form>
  );
}

function ProductSelect({
  index,
  defaultList,
}: {
  index: number;
  defaultList?: TProduct[];
}) {
  const { control } = useFormContext<TPurchaseOrderCreateSchema>();
  const { fields, remove } = useFieldArray({
    control: control,
    name: "items",
  });
  const [query, setQuery] = useState("");
  const { data: products, isLoading: isLoadingProducts } = useGetAllItemsQuery({
    limit: 500,
    page: 1,
    query: query,
  });

  const dataList = query
    ? products?.data.data?.list
    : defaultList?.length
      ? defaultList
      : products?.data.data?.list;

  const getProduct = (id: number) => {
    return dataList?.find((p) => p.id === id);
  };

  return (
    <div className="group grid relative gap-3 border p-3 rounded-lg bg-card/50 transition-colors hover:bg-card">
      <FormField
        control={control}
        name={`items.${index}.itemId`}
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel className="text-[11px] uppercase text-muted-foreground tracking-wider">
              Product
            </FormLabel>

            <FormControl>
              <SearchableSelect
                list={defaultList ?? []}
                query={query}
                onQueryChange={setQuery}
                onValueChange={(val) => field.onChange(Number(val))}
                isLoading={isLoadingProducts}
              >
                <SearchableSelectTrigger>
                  <Button
                    type="button"
                    className="w-full justify-start"
                    variant={"outline"}
                  >
                    {getProduct(field.value)?.name ?? "Select product"}
                  </Button>
                </SearchableSelectTrigger>
                <SearchableSelectContent>
                  <SearchableSelectInput />
                  <SearchableSelectList>
                    <SearchableSelectVacuum />
                    {dataList?.map((product) => (
                      <SearchableSelectItem
                        key={product.id}
                        value={product.id.toString()}
                      >
                        {product.name}
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

      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={control}
          name={`items.${index}.quantity`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] uppercase text-muted-foreground tracking-wider">
                Qty
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  className="h-9"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`items.${index}.unitPrice`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] uppercase text-muted-foreground tracking-wider">
                Unit Price
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                    ₹
                  </span>
                  <Input
                    type="number"
                    className="h-9 pl-6"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="md:col-span-1 pt-6 flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => remove(index)}
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          disabled={fields.length === 1}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
