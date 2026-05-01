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
import type { TVendorUpdateSchema } from "@repo/contracts/vendor";
import {
  Loader2,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

export default function UpdateVendorForm({
  form,
  onSubmit,
}: TFormProps<TVendorUpdateSchema>) {
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
                  <Building2 className="h-3 w-3" />
                  Vendor Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter vendor name"
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
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest mb-2 flex items-center gap-2">
                  <User className="h-3 w-3" />
                  Contact Person
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter contact person name"
                    className="h-11 bg-background border-border/60 focus:bg-background transition-all font-bold text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-muted/10 p-5 rounded-2xl border border-border/50">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest mb-2 flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  Phone
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter phone number"
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest mb-2 flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  Email (Optional)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter email"
                    type="email"
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
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest mb-2 flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  Address (Optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="resize-none bg-background border-border/60 focus:bg-background transition-all font-bold text-sm min-h-[100px]"
                    placeholder="Enter address"
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
              <RefreshCw className="h-5 w-5" />
              <span>Update Vendor</span>
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </Button>
      </form>
    </Form>
  );
}
