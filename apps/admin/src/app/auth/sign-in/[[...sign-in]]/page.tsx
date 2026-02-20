"use client";

import type { TSignIn } from "@repo/contracts/sign-in";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@repo/contracts/sign-in";
import { getDefaultSignInValues } from "@/constants/form-defaults/sign-in";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SignInForm from "@/components/custom/forms/sign-in";

export default function SignInPage() {
  const form = useForm<TSignIn>({
    resolver: zodResolver(signInSchema),
    defaultValues: getDefaultSignInValues(),
  });

  const handleSubmit = async (data: TSignIn) => {};

  return (
    <Card className="md:min-w-lg min-w-full">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <SignInForm form={form} onSubmit={handleSubmit} />
      </CardContent>
    </Card>
  );
}
