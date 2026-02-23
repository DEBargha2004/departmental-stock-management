import { useMutation } from "@tanstack/react-query";
import {
  forgetPasswordRequest,
  resetPasswordRequest,
  signInRequest,
} from "./api";

export const useSignInMutation = () =>
  useMutation({ mutationFn: signInRequest });

export const useForgetPasswordMutation = () =>
  useMutation({ mutationFn: forgetPasswordRequest });

export const useResetPasswordMutation = () =>
  useMutation({ mutationFn: resetPasswordRequest });
