import { TSignIn } from "@repo/contracts/sign-in";

export const getDefaultSignInValues = (): TSignIn => ({
  email: "",
  password: "",
});
