import ForgetPasswordForm from "@/components/custom/forms/forget-password";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDefaultForgetPasswordValues } from "@/constants/form-defaults/forget-password";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgetPasswordSchema,
  type TForgetPassword,
} from "@repo/contracts/forget-password";
import { CheckCircle2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const RESET_LINK_SENT_KEY = "resetLinkSent";

export default function ForgetPasswordPage() {
  const [resetLinkSent, setResetLinkSent] = useState<boolean | null>(null);
  const form = useForm<TForgetPassword>({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: getDefaultForgetPasswordValues(),
  });

  const onSubmit = async (data: TForgetPassword) => {
    console.log(data);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResetLinkSent(localStorage.getItem(RESET_LINK_SENT_KEY) === "true");
  }, []);

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
