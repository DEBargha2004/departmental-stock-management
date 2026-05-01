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
import { Textarea } from "@/components/ui/textarea";
import type { TFormProps } from "@/types/form-props";
import type { TCategoryCreateSchema } from "@repo/contracts/category";
import {
  Loader2,
  Tag,
  FileText,
  ChevronRight,
  Plus,
} from "lucide-react";

export default function CreateCategoryForm({
  form,
  onSubmit,
}: TFormProps<TCategoryCreateSchema>) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-muted/10 p-5 rounded-2xl border border-border/50">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest mb-2 flex items-center gap-2">
                  <Tag className="h-3 w-3" />
                  Category Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter category name"
                    className="h-11 bg-background border-border/60 focus:bg-background transition-all font-bold text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
        </div>

        <div className="bg-muted/10 p-5 rounded-2xl border border-border/50">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest mb-2 flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  Description (Optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter category description"
                    className="resize-none bg-background border-border/60 focus:bg-background transition-all font-bold text-sm min-h-[100px]"
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
              <span>Create Category</span>
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </Button>
      </form>
    </Form>
  );
}
