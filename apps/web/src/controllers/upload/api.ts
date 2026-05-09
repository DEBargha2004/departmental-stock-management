import { api } from "@/lib/axios";
import type { TSuccess } from "@/types/response";
import axios, { type AxiosResponse } from "axios";

export type TUploadResponse = {
  url: string;
  path: string;
};

export async function getPresignedUrlRequest(endpoint: string): Promise<AxiosResponse<TSuccess<TUploadResponse>>> {
  return api.get(endpoint);
}

export async function uploadToPresignedUrlRequest(url: string, file: File): Promise<AxiosResponse<void>> {
  return axios.put(url, file, {
    headers: {
      "Content-Type": file.type,
    },
  });
}
