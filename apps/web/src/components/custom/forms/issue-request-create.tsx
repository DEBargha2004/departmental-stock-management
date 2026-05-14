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
  Package,
  ShoppingCart,
  ChevronRight,
  Hash,
  Box,
  User,
} from "lucide-react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import type { TFormProps } from "@/types/form-props";
import type { TIssueRequestCreateSchema } from "@repo/contracts/circulation";
import { useGetAllUsersQuery } from "@/controllers/user/query";
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
import type { TProduct } from "@repo/contracts/item";
import { getDefaultIssueRequestItemValues } from "@/constants/form-defaults/issue-request";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import type { TUser } from "@repo/contracts/user";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDateForInput } from "@/lib/utils";

export default function CreateIssueRequestForm({
  form,
  onSubmit,
  defaultList,
  label = "Create Issue Request",
}: TFormProps<TIssueRequestCreateSchema> & {
  defaultList?: {
    users?: TUser[];
    products?: TProduct[];
  };
  label?: string;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const [query, setQuery] = useState({
    users: "",
    products: "",
  });

  const debouncedUsersQuery = useDebounce(query.users, 500);

  const { data: usersData, isLoading: isLoadingUsers } = useGetAllUsersQuery({
    limit: 20,
    page: 1,
    status: "active",
    query: debouncedUsersQuery,
  });

  const users =
    (query.users
      ? usersData?.data?.data?.list
      : defaultList?.users?.length
        ? defaultList?.users
        : usersData?.data?.data?.list) ?? [];

  const selectedUserId = useWatch({
    control: form.control,
    name: "userId",
  });

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const items = useWatch({
    control: form.control,
    name: "items",
  });

  const handleDeleteItem = (index: number) => {
    remove(index);
    if (items.length === 1) {
      append(getDefaultIssueRequestItemValues());
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-muted/10 p-5 rounded-2xl border border-border/50">
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest mb-2 flex items-center gap-2">
                  <User className="h-3 w-3" />
                  Issue To
                </FormLabel>
                <FormControl>
                  <SearchableSelect
                    query={query.users}
                    onQueryChange={(q) =>
                      setQuery((prev) => ({ ...prev, users: q }))
                    }
                    onValueChange={(val) => field.onChange(Number(val))}
                    isLoading={isLoadingUsers}
                  >
                    <SearchableSelectTrigger asChild>
                      <Button
                        type="button"
                        className="w-full justify-between h-11 px-3 bg-background hover:bg-muted/50 border-border/60 transition-all duration-200"
                        variant={"outline"}
                      >
                        {selectedUser ? (
                          <div className="flex items-center gap-2.5 text-left min-w-0">
                            <User className="h-4 w-4 text-primary shrink-0" />
                            <div className="flex flex-col items-start min-w-0">
                              <span className="font-bold text-sm truncate">
                                {selectedUser.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground/60 font-bold">
                                {selectedUser.email}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 text-xs">
                            Select User
                          </span>
                        )}
                        <ChevronRight className="h-4 w-4 opacity-30" />
                      </Button>
                    </SearchableSelectTrigger>
                    <SearchableSelectContent>
                      <SearchableSelectInput placeholder="Search users..." />
                      <SearchableSelectList className="max-h-[250px] custom-scrollbar">
                        <SearchableSelectVacuum listLength={users.length} />
                        {users.map((user) => (
                          <SearchableSelectItem
                            key={user.id}
                            value={user.id.toString()}
                            className="py-3 px-4"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                {user.name.charAt(0)}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                                  {user.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground/70 uppercase font-bold tracking-tight">
                                  {user.role}
                                </span>
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

          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest mb-2 flex items-center gap-2">
                  <CalendarIcon className="h-3 w-3" />
                  Issue Date
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="h-11 bg-background border-border/60 focus:bg-background transition-all font-bold text-sm cursor-pointer"
                    {...field}
                    value={formatDateForInput(field.value)}
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
                Requested Items
              </h3>
              <Badge variant="secondary" className="font-mono text-[10px] h-5">
                {fields.length}
              </Badge>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append(getDefaultIssueRequestItemValues())}
              className="h-8 px-3 gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar -mr-3">
            {fields.map((field, index) => (
              <ProductSelect
                key={field.id}
                index={index}
                handleDeleteItem={handleDeleteItem}
                defaultList={defaultList?.products ?? []}
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

function ProductSelect({
  index,
  defaultList,
  handleDeleteItem,
}: {
  index: number;
  defaultList?: TProduct[];
  handleDeleteItem: (index: number) => void;
}) {
  const { control } = useFormContext<TIssueRequestCreateSchema>();
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
    return dataList?.find((p) => p.id === Number(id));
  };

  return (
    <div className="group relative bg-background hover:bg-muted/10 transition-all duration-300 rounded-2xl border border-border/60 p-5 shadow-sm hover:shadow-md space-y-5">
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
                  onValueChange={(val) => field.onChange(Number(val))}
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
              />
            </FormControl>
            <FormMessage className="text-[9px]" />
          </FormItem>
        )}
      />
    </div>
  );
}
