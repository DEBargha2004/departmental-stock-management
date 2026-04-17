import { api } from "@/lib/axios";
import type { PaginatedListResponse } from "@/types/list-response";
import type { TSuccess } from "@/types/response";
import type {
  TProductCreateSchema,
  TProductUpdateSchema,
} from "@repo/contracts/item";
import type { TProductQuery } from "@repo/contracts/query";
import type { AxiosResponse } from "axios";

export type TProduct = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  category: {
    id: number;
    name: string;
    description: string;
  };
  stock: {
    quantity: number;
    minStockLevel: number;
  };
};

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
  const params = new URLSearchParams({
    query: query || "",
    limit: limit.toString(),
    page: page.toString(),
  });

  if (status) params.append("status", status);
  if (category) params.append("category", category.toString());

  return api.get(`/inventory/item/list?${params.toString()}`);
}
