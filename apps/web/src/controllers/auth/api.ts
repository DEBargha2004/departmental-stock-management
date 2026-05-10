import { api } from "@/lib/axios";
import type { TSuccess } from "@/types/response";
import type { TForgetPassword } from "@repo/contracts/forget-password";
import type { TResetPassword } from "@repo/contracts/reset-password";
import type { TSignIn } from "@repo/contracts/sign-in";
import type { AxiosResponse } from "axios";

export async function signInRequest(
  data: TSignIn,
): Promise<AxiosResponse<TSuccess<string>>> {
  return await api.post(`/auth/sign-in`, data);
}

export async function forgetPasswordRequest(
  data: TForgetPassword,
): Promise<AxiosResponse<TSuccess<null>>> {
  return await api.post(`/auth/forget-password`, data);
}

export async function resetPasswordRequest(
  data: TResetPassword,
): Promise<AxiosResponse<TSuccess<null>>> {
  return await api.post(`/auth/reset-password`, data);
}
