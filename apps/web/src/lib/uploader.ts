import axios, { type AxiosResponse } from "axios";
import { catchError } from "./catch-error";
import type { TSuccess } from "@/types/response";
import { api } from "./axios";

export function getUploader(url: string) {
  return async (file: File): Promise<string> => {
    const [err, res] = await catchError<
      AxiosResponse<TSuccess<{ url: string; path: string }>>
    >(api.get(url));

    if (err) return Promise.reject(err);

    const data = res?.data?.data;
    if (!data) return Promise.reject(new Error("Invalid response from server"));

    const [uploadErr] = await catchError(axios.put(data.url, file));

    if (uploadErr) return Promise.reject(err);

    return data.path;
  };
}
