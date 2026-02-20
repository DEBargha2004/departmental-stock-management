"use client";

import ResetPasswordForm from "@/components/custom/forms/reset-password";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDefaultResetPasswordValues } from "@/constants/form-defaults/reset-password";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  TResetPassword,
} from "@repo/contracts/reset-password";
import { use } from "react";
import { useForm } from "react-hook-form";

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  const form = useForm<TResetPassword>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      ...getDefaultResetPasswordValues(),
      code: token,
    },
  });

  const onSubmit = async (data: TResetPassword) => {};

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
