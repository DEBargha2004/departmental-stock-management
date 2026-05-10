import { api } from "@/lib/axios";
import type { PaginatedListResponse } from "@/types/list-response";
import type { TSuccess } from "@/types/response";
import type {
  TProductCreateSchema,
  TProductUpdateSchema,
  TProduct,
} from "@repo/contracts/item";
import type { TProductQuery } from "@repo/contracts/query";
import type { AxiosResponse } from "axios";

export async function createItemRequest(
  data: TProductCreateSchema,
): Promise<AxiosResponse<TSuccess<TProduct>>> {
  return api.post(`/inventory/item/create`, data);
}

export async function updateItemRequest(params: {
  id: number;
  payload: TProductUpdateSchema;
}): Promise<AxiosResponse<TSuccess<TProduct>>> {
  return api.patch(`/inventory/item/${params.id}`, params.payload);
}

export async function deleteItemRequest(params: {
  id: number;
}): Promise<AxiosResponse<TSuccess<null>>> {
  return api.delete(`/inventory/item/${params.id}`);
}

export async function getItemRequest(params: {
  id: number;
}): Promise<AxiosResponse<TSuccess<TProduct>>> {
  return api.get(`/inventory/item/${params.id}`);
}

export async function getAllItemsRequest({
  query = "",
  limit = 20,
  page = 1,
  status,
  category,
}: TProductQuery): Promise<
  AxiosResponse<TSuccess<PaginatedListResponse<TProduct[]>>>
> {
  return api.get(`/inventory/item/list`, {
    params: {
      query,
      limit,
      page,
      status,
      category,
    },
  });
}
