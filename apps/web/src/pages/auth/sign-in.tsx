import { type TSignIn, signInSchema } from "@repo/contracts/sign-in";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getDefaultSignInValues } from "@/constants/form-defaults/sign-in";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SignInForm from "@/components/custom/forms/sign-in";
import { useSignInMutation } from "@/features/auth/mutation";
import { catchError } from "@/lib/catch-error";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";

export default function SignInPage() {
  const form = useForm<TSignIn>({
    resolver: zodResolver(signInSchema),
    defaultValues: getDefaultSignInValues(),
  });
  const { mutateAsync } = useSignInMutation();
  const { login } = useAuth();

  const handleSubmit = async (data: TSignIn) => {
    const [err, res] = await catchError(mutateAsync(data));

    if (err) {
      toast.error(err.message);
      return;
    }

    const { data: jwt } = res.data;
    login(jwt!);
  };

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
