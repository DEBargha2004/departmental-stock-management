import { useMutation } from "@tanstack/react-query";
import { signInRequest } from "./api";

export const useSignInMutation = () =>
  useMutation({ mutationFn: signInRequest });
