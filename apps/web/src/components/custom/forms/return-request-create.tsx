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
  ShoppingCart,
  ChevronRight,
  Hash,
  Box,
  MessageSquare,
  RotateCcw,
  Package,
  CheckCircle2,
  Info,
  AlertCircle,
} from "lucide-react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import type { TFormProps } from "@/types/form-props";
import type {
  TReturnRequestCreateSchema,
  TIssueRequestItem,
  TIssueRequest,
} from "@repo/contracts/circulation";
import { useState } from "react";

import SearchableSelect, {
  SearchableSelectContent,
  SearchableSelectInput,
  SearchableSelectItem,
  SearchableSelectList,
  SearchableSelectTrigger,
  SearchableSelectVacuum,
} from "../searchable-select";
import { getDefaultReturnRequestItemValues } from "@/constants/form-defaults/return-request";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { formatDateForInput } from "@/lib/utils";
import { useGetAllIssueRequestsQuery } from "@/controllers/issue-request/query";

export default function CreateReturnRequestForm({
  form,
  onSubmit,
  defaultList,
  label = "Create Return Request",
}: TFormProps<TReturnRequestCreateSchema> & {
  defaultList?: {
    issueRequests?: TIssueRequest[];
  };
  label?: string;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const items = useWatch({
    control: form.control,
    name: "items",
  });

  const handleDeleteItem = (index: number) => {
    remove(index);
    if (items.length === 1) {
      append(getDefaultReturnRequestItemValues());
    }
  };

  const [issueQuery, setIssueQuery] = useState("");
  const { data: issueRequestsData, isLoading: isLoadingIssues } =
    useGetAllIssueRequestsQuery({
      limit: 500,
      page: 1,
      query: issueQuery,
    });

  const issueRequestsList =
    (issueQuery
      ? issueRequestsData?.data.data?.list
      : defaultList?.issueRequests?.length
        ? defaultList.issueRequests
        : issueRequestsData?.data.data?.list) ?? [];

  const selectedIssueRequestId = useWatch({
    control: form.control,
    name: "issueRequestId",
  });

  const selectedIssueRequest = issueRequestsList.find(
    (ir) => ir.id === selectedIssueRequestId,
  );
  const availableItems = selectedIssueRequest?.items ?? [];

  const getSelectedIssueRequest = (id: number) => {
    return issueRequestsList.find((ir) => ir.id === id);
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="bg-muted/10 p-5 rounded-2xl border border-border/50 grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="issueRequestId"
            render={({ field }) => (
              <FormItem className="flex-1 min-w-0">
                <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest mb-2 flex items-center gap-2">
                  <Hash className="h-3 w-3" />
                  Issue Order
                </FormLabel>
                <FormControl>
                  <SearchableSelect
                    query={issueQuery}
                    onQueryChange={setIssueQuery}
                    onValueChange={(val) => {
                      field.onChange(Number(val));
                      form.setValue("items", [
                        getDefaultReturnRequestItemValues(),
                      ]);
                    }}
                    isLoading={isLoadingIssues}
                  >
                    <SearchableSelectTrigger asChild>
                      <Button
                        type="button"
                        className="w-full justify-between h-11 px-3 bg-background border-border/60 focus:bg-background transition-all font-bold text-sm"
                        variant={"outline"}
                      >
                        {field.value && field.value !== -1 ? (
                          <div className="flex items-center gap-2.5 text-left min-w-0">
                            <span className="text-sm font-bold truncate">
                              {getSelectedIssueRequest(field.value)?.issueCode}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50 text-xs">
                            Select Issue Order...
                          </span>
                        )}
                        <ChevronRight className="h-4 w-4 opacity-20 shrink-0" />
                      </Button>
                    </SearchableSelectTrigger>
                    <SearchableSelectContent className="w-[350px]">
                      <SearchableSelectInput placeholder="Search issue orders..." />
                      <SearchableSelectList className="max-h-[280px] custom-scrollbar">
                        <SearchableSelectVacuum
                          listLength={issueRequestsList.length}
                        />
                        {issueRequestsList.map((ir) => (
                          <SearchableSelectItem
                            key={ir.id}
                            value={ir.id.toString()}
                            className="py-2.5"
                          >
                            <div className="flex items-center justify-between w-full gap-3">
                              <span className="font-bold text-sm">
                                {ir.issueCode}
                              </span>
                              <span className="text-[9px] text-muted-foreground uppercase font-bold">
                                {formatDateForInput(ir.issueDate.toString())}
                              </span>
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

          <FormField
            control={form.control}
            name="returnDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest mb-2 flex items-center gap-2">
                  <CalendarIcon className="h-3 w-3" />
                  Return Date
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="h-11 bg-background border-border/60 focus:bg-background transition-all font-bold text-sm cursor-pointer"
                    {...field}
                    value={formatDateForInput(field.value.toString())}
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground/80">
                Returned Items
              </h3>
              <Badge variant="secondary" className="font-mono text-[10px] h-5">
                {fields.length}
              </Badge>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={
                selectedIssueRequestId === -1 ||
                selectedIssueRequestId === undefined
              }
              onClick={() => append(getDefaultReturnRequestItemValues())}
              className="h-8 px-3 gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar -mr-3 pt-2">
            {fields.map((field, index) => (
              <IssueItemSelect
                key={field.id}
                index={index}
                handleDeleteItem={handleDeleteItem}
                availableItems={availableItems}
              />
            ))}
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
              <span>{label}</span>
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </Button>
      </form>
    </Form>
  );
}

function IssueItemSelect({
  index,
  availableItems,
  handleDeleteItem,
}: {
  index: number;
  availableItems: TIssueRequestItem[];
  handleDeleteItem: (index: number) => void;
}) {
  const { control } = useFormContext<TReturnRequestCreateSchema>();
  const [query, setQuery] = useState("");

  const quantityDamaged =
    useWatch({
      control,
      name: `items.${index}.quantityDamaged`,
    }) ?? 0;

  const quantityReceived =
    useWatch({
      control,
      name: `items.${index}.quantityReceived`,
    }) ?? 0;

  const allSelectedItems = useWatch({
    control,
    name: "items",
  });

  const selectedIssueItemId = useWatch({
    control,
    name: `items.${index}.issueItemId`,
  });

  const selectedItem = availableItems.find((i) => i.id === selectedIssueItemId);

  const unselectedItems = availableItems.filter((item) => {
    return !allSelectedItems.some(
      (selectedFormItem, idx) =>
        selectedFormItem.issueItemId === item.id && idx !== index,
    );
  });

  const filteredItems = unselectedItems.filter((item) =>
    item.product.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="group relative bg-muted/20 hover:bg-muted/40 transition-all duration-300 rounded-xl border border-border/40 p-4 flex flex-col gap-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <FormField
          control={control}
          name={`items.${index}.issueItemId`}
          render={({ field }) => (
            <FormItem className="flex-1 min-w-0">
              <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/80 flex items-center gap-2 tracking-widest mb-2">
                <Box className="h-3 w-3" />
                Product to Return
              </FormLabel>
              <FormControl>
                <SearchableSelect
                  query={query}
                  onQueryChange={setQuery}
                  onValueChange={(val) => field.onChange(Number(val))}
                  isLoading={false}
                >
                  <SearchableSelectTrigger asChild>
                    <Button
                      type="button"
                      className="w-full justify-between h-14 px-4 bg-background hover:bg-muted/30 border-dashed border-2 hover:border-primary/50 transition-all duration-300"
                      variant={"outline"}
                    >
                      {selectedItem ? (
                        <div className="flex items-center gap-3 text-left">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold tracking-tight">
                              {selectedItem.product.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase font-medium flex items-center gap-1">
                              Issued: {selectedItem.quantity} Units
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-muted-foreground/60">
                          <div className="h-9 w-9 rounded-full bg-muted/40 flex items-center justify-center border border-dashed border-muted-foreground/20">
                            <Package className="h-5 w-5" />
                          </div>
                          <span className="font-medium">Select Product...</span>
                        </div>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30" />
                    </Button>
                  </SearchableSelectTrigger>
                  <SearchableSelectContent>
                    <SearchableSelectInput placeholder="Search items..." />
                    <SearchableSelectList className="max-h-[250px] custom-scrollbar">
                      <SearchableSelectVacuum
                        listLength={filteredItems.length}
                      />
                      {filteredItems.map((item) => (
                        <SearchableSelectItem
                          key={item.id}
                          value={item.id.toString()}
                          className="py-3 px-3 cursor-pointer"
                        >
                          <div className="flex flex-col gap-1.5 w-full">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-primary/70" />
                                <span className="font-bold text-sm">
                                  {item.product.name}
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-[9px] uppercase font-bold px-1.5 py-0 h-4 bg-primary/5 text-primary border-primary/20"
                              >
                                {item.quantity} ISSUED
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
                              Prod ID: {item.product.id}
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
        <div className="pt-8 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteItem(index)}
            className="h-10 w-10 rounded-xl text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {selectedItem && (
        <>
          <Separator className="bg-border/40" />
          <div className="flex items-end gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name={`items.${index}.quantityReceived`}
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/80 flex items-center gap-2 tracking-widest">
                      <RotateCcw className="h-3 w-3" />
                      Returned Qty
                    </FormLabel>
                    <FormControl>
                      <div className="relative group/input">
                        <Input
                          type="number"
                          className="h-11 pr-24 bg-background/60 focus:bg-background transition-all border-border/60 focus:border-primary/50 font-mono font-bold text-base"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/40 flex items-center gap-1.5 pointer-events-none">
                          / {selectedItem.quantity} ISSUED
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`items.${index}.quantityDamaged`}
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/80 flex items-center gap-2 tracking-widest">
                      <Trash2 className="h-3 w-3 text-destructive" />
                      Damaged Qty
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="h-11 bg-background/60 focus:bg-background transition-all border-border/60 focus:border-destructive/50 font-mono font-bold text-base"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )}
              />
            </div>

            <div className="pb-0.5 shrink-0 hidden sm:block">
              {quantityReceived + quantityDamaged === selectedItem.quantity ? (
                <div
                  className="h-11 w-11 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center animate-in zoom-in duration-300"
                  title="Full quantity returned"
                >
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
              ) : quantityReceived > 0 &&
                quantityReceived < selectedItem.quantity ? (
                <div
                  className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center animate-in zoom-in duration-300"
                  title="Partial quantity returned"
                >
                  <Info className="h-6 w-6 text-amber-500" />
                </div>
              ) : (
                <div
                  className="h-11 w-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center animate-in zoom-in duration-300"
                  title="No quantity returned"
                >
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
              )}
            </div>
          </div>

          {(quantityDamaged ?? 0) > 0 && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <FormField
                control={control}
                name={`items.${index}.reason`}
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/80 flex items-center gap-2 tracking-widest">
                      <MessageSquare className="h-3 w-3 text-muted-foreground" />
                      Damage Reason
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Please provide details about the damage..."
                        className="h-11 bg-background/60 focus:bg-background transition-all border-border/60 focus:border-primary/50 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
