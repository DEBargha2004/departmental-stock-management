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
} from "lucide-react";
import UploadImage from "../upload-image";
import { getUploader } from "@/lib/uploader";

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
  const uploader = getUploader(`/upload/product-image`);

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
                    uploader={uploader}
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
