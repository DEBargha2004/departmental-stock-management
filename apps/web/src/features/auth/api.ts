import { api } from "@/lib/axios";
import type { TSuccess } from "@/types/response";
import type { TSignIn } from "@repo/contracts/sign-in";
import type { AxiosResponse } from "axios";

export async function signInRequest(
  data: TSignIn,
): Promise<AxiosResponse<TSuccess<string>>> {
  return await api.post(`${import.meta.env.VITE_API_URL}/auth/sign-in`, data);
}
