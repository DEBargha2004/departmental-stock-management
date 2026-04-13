import { API_URL } from "@/constants/api";
import { api } from "@/lib/axios";
import type { PaginatedListResponse } from "@/types/list-response";
import type { TSuccess } from "@/types/response";
import type { TVendorQuery } from "@repo/contracts/query";
import type { AxiosResponse } from "axios";
import type {
  TVendorCreateSchema,
  TVendorUpdateSchema,
} from "@repo/contracts/vendor";

type TVendor = {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  isActive: boolean;
  lastOrderDate?: null;
};

export async function createVendorRequest(
  data: TVendorCreateSchema,
): Promise<AxiosResponse<TSuccess<TVendor>>> {
  return api.post(`${API_URL}/vendor/create`, data);
}

export async function updateVendorRequest(params: {
  id: number;
  payload: TVendorUpdateSchema;
}): Promise<AxiosResponse<TSuccess<TVendor>>> {
  return api.patch(`${API_URL}/vendor/${params.id}`, params.payload);
}

export async function deleteVendorRequest(params: {
  id: number;
}): Promise<AxiosResponse<TSuccess<null>>> {
  return api.delete(`${API_URL}/vendor/${params.id}`);
}

export async function getVendorRequest(params: {
  id: number;
}): Promise<AxiosResponse<TSuccess<TVendor>>> {
  return api.get(`${API_URL}/vendor/${params.id}`);
}

export async function getAllVendorsRequest({
  query = "",
  status,
  limit,
  page,
}: TVendorQuery): Promise<
  AxiosResponse<TSuccess<PaginatedListResponse<TVendor[]>>>
> {
  return api.get(
    `${API_URL}/vendor/list?${new URLSearchParams({
      query,
      ...(status && { status }),
      limit: limit.toString(),
      page: page.toString(),
    }).toString()}`,
  );
}
