import ResetPasswordForm from "@/components/custom/forms/reset-password";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDefaultResetPasswordValues } from "@/constants/form-defaults/reset-password";
import { useResetPasswordMutation } from "@/features/auth/mutation";
import { catchError } from "@/lib/catch-error";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type TResetPassword,
} from "@repo/contracts/reset-password";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const form = useForm<TResetPassword>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      ...getDefaultResetPasswordValues(),
      code: token,
    },
  });
  const navigate = useNavigate();

  const { mutateAsync } = useResetPasswordMutation();
  const onSubmit = async (data: TResetPassword) => {
    const [err, res] = await catchError(mutateAsync(data));

    if (err) {
      toast.error(err.message);
      return;
    }

    toast.message(res.data.message);
    navigate("/auth/sign-in");
  };

  return (
    <Card className="md:min-w-lg min-w-full">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm form={form} onSubmit={onSubmit} />
      </CardContent>
    </Card>
  );
}
