import type { TResetPassword } from "@repo/contracts/reset-password";

export const getDefaultResetPasswordValues = (): TResetPassword => ({
  code: "",
  password: "",
  confirmPassword: "",
});
