import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TFormProps } from "@/types/form-props";
import PasswordInput from "../password-input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { TSignIn } from "@repo/contracts/sign-in";

export default function SignInForm({ form, onSubmit }: TFormProps<TSignIn>) {
  const { isSubmitting } = form.formState;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput {...field} />
              </FormControl>
              <Link
                href={"/auth/forget-password"}
                className="text-sm ml-auto text-primary/80 hover:text-primary"
              >
                Forget Password?
              </Link>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <span>Sign In</span>
          )}
        </Button>
      </form>
    </Form>
  );
}
