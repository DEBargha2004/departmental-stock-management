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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useGetAllCategoriesQuery } from "@/controllers/category/query";

import type { TFormProps } from "@/types/form-props";
import type { TProductCreateSchema } from "@repo/contracts/item";
import {
  Loader2,
  Package,
  Tag,
  IndianRupee,
  ArrowDownToLine,
  Layers,
  ChevronRight,
  Plus,
  Image as ImageIcon,
  CheckCircle2,
  AlignLeft,
} from "lucide-react";
import UploadImage from "../upload-image";
import { useProductImageUpload } from "@/controllers/upload/mutation";


export default function ProductCreateForm({
  form,
  onSubmit,
}: TFormProps<TProductCreateSchema>) {
  const { data: categories, isLoading: isCategoriesLoading } =
    useGetAllCategoriesQuery({
      limit: 100,
      page: 1,
    });

  const categoryList = categories?.data?.data?.list ?? [];
  const { uploadProductImage, isPending: isUploading } = useProductImageUpload();


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-muted/10 p-5 rounded-2xl border border-border/50">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest mb-2 flex items-center gap-2">
                  <Package className="h-3 w-3" />
                  Product Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter product name"
                    className="h-11 bg-background border-border/60 focus:bg-background transition-all font-bold text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest mb-2 flex items-center gap-2">
                  <Tag className="h-3 w-3" />
                  Category
                </FormLabel>
                <FormControl>
                  <Select
                    value={field.value?.toString()}
                    onValueChange={field.onChange}
                    disabled={isCategoriesLoading}
                  >
                    <SelectTrigger className="h-11 w-full bg-background border-border/60 focus:bg-background transition-all font-bold text-sm">
                      <SelectValue
                        placeholder={
                          isCategoriesLoading ? "Loading..." : "Select category"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {categoryList.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest mb-2 flex items-center gap-2">
                    <AlignLeft className="h-3 w-3" />
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly describe the product..."
                      className="min-h-[80px] max-h-[160px] field-sizing-content bg-background border-border/60 focus:bg-background transition-all font-medium text-sm py-2.5 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="bg-muted/10 p-5 rounded-2xl border border-border/50">
          <FormField
            control={form.control}
            name="isConsumable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border/50 p-4 bg-background/50">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Consumable Item
                  </FormLabel>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Consumable items are one-time use and don't need to be
                    returned.
                  </p>
                </div>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="h-5 w-5 rounded-md border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="bg-muted/10 p-5 rounded-2xl border border-border/50">
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest mb-4 flex items-center gap-2">
                  <ImageIcon className="h-3 w-3" />
                  Product Image
                </FormLabel>
                <FormControl>
                  <UploadImage
                    value={field.value}
                    onValueChange={field.onChange}
                    uploader={uploadProductImage}
                    isUploading={isUploading}
                  />

                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-muted/10 p-5 rounded-2xl border border-border/50">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest mb-2 flex items-center gap-2">
                  <IndianRupee className="h-3 w-3" />
                  Price
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 font-black text-[10px]">
                      ₹
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="h-11 pl-7 bg-background border-border/60 focus:bg-background transition-all font-mono font-bold text-sm"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minStockLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest mb-2 flex items-center gap-2">
                  <ArrowDownToLine className="h-3 w-3" />
                  Min Stock
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
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
            name="currentStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest mb-2 flex items-center gap-2">
                  <Layers className="h-3 w-3" />
                  Initial Stock
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    className="h-11 bg-background border-border/60 focus:bg-background transition-all font-mono font-bold text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
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
              <Plus className="h-5 w-5" />
              <span>Create Product</span>
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </Button>
      </form>
    </Form>
  );
}
