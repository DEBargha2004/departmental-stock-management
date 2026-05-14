import type { TSuccess } from "@/types/response";
import type { AxiosResponse } from "axios";
import type { MODULE } from "@repo/contracts/module";
import { api } from "@/lib/axios";

export async function getAccessListRequest(): Promise<
  AxiosResponse<TSuccess<MODULE[]>>
> {
  return api.get("/authorization/access-list");
}

export async function getPermissionsRequest(): Promise<
  AxiosResponse<TSuccess<string[]>>
> {
  return api.get("/authorization/permissions");
}
