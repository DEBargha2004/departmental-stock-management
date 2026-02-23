import ForgetPasswordForm from "@/components/custom/forms/forget-password";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDefaultForgetPasswordValues } from "@/constants/form-defaults/forget-password";
import { useForgetPasswordMutation } from "@/features/auth/mutation";
import { catchError } from "@/lib/catch-error";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgetPasswordSchema,
  type TForgetPassword,
} from "@repo/contracts/forget-password";
import { CheckCircle2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// const RESET_LINK_SENT_KEY = "resetLinkSent";

export default function ForgetPasswordPage() {
  const [resetLinkSent, setResetLinkSent] = useState<boolean | null>(false);
  const form = useForm<TForgetPassword>({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: getDefaultForgetPasswordValues(),
  });
  const { mutateAsync } = useForgetPasswordMutation();

  const onSubmit = async (data: TForgetPassword) => {
    const [err, res] = await catchError(mutateAsync(data));

    if (err) {
      toast.error(err.message);
      return;
    }

    toast.message(res.data.message);
    setResetLinkSent(true);
  };

  return (
    <Card className="md:min-w-lg min-w-full">
      <CardHeader>
        <CardTitle>Forget Password</CardTitle>
      </CardHeader>
      <CardContent>
        {resetLinkSent ? (
          <div className="flex flex-col justify-center items-center gap-4">
            <CheckCircle2Icon className="text-green-500" size={40} />
            <span className="text-muted-foreground">
              Reset password link has been sent to your mail
            </span>
          </div>
        ) : resetLinkSent === null ? null : (
          <ForgetPasswordForm form={form} onSubmit={onSubmit} />
        )}
      </CardContent>
    </Card>
  );
}
