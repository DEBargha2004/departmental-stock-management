import { api } from "@/lib/axios";
import type { PaginatedListResponse } from "@/types/list-response";
import type { TSuccess } from "@/types/response";
import type { TVendorQuery } from "@repo/contracts/query";
import type { AxiosResponse } from "axios";
import type {
  TVendorCreateSchema,
  TVendorUpdateSchema,
  TVendor,
} from "@repo/contracts/vendor";



export async function createVendorRequest(
  data: TVendorCreateSchema,
): Promise<AxiosResponse<TSuccess<TVendor>>> {
  return api.post(`/vendor/create`, data);
}

export async function updateVendorRequest(params: {
  id: number;
  payload: TVendorUpdateSchema;
}): Promise<AxiosResponse<TSuccess<TVendor>>> {
  return api.patch(`/vendor/${params.id}`, params.payload);
}

export async function deleteVendorRequest(params: {
  id: number;
}): Promise<AxiosResponse<TSuccess<null>>> {
  return api.delete(`/vendor/${params.id}`);
}

export async function getVendorRequest(params: {
  id: number;
}): Promise<AxiosResponse<TSuccess<TVendor>>> {
  return api.get(`/vendor/${params.id}`);
}

export async function getAllVendorsRequest({
  query = "",
  status,
  limit,
  page,
}: TVendorQuery): Promise<
  AxiosResponse<TSuccess<PaginatedListResponse<TVendor[]>>>
> {
  return api.get(`/vendor/list`, {
    params: {
      query,
      status,
      limit,
      page,
    },
  });
}

