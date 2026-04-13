import { api } from "@/lib/axios";
import type { PaginatedListResponse } from "@/types/list-response";
import type { TSuccess } from "@/types/response";
import type { TCategoryCreateSchema } from "@repo/contracts/category";
import type { TCategoryQuery } from "@repo/contracts/query";
import type { AxiosResponse } from "axios";

type TCategory = {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  itemsCount: number;
};

export async function createCategoryRequest(
  data: TCategoryCreateSchema,
): Promise<AxiosResponse<TSuccess<TCategory>>> {
  return api.post(`/inventory/category/create`, data);
}

export async function updateCategoryRequest(params: {
  id: number;
  payload: TCategoryCreateSchema;
}): Promise<AxiosResponse<TSuccess<TCategory>>> {
  return api.patch(`/inventory/category/${params.id}`, params.payload);
}

export async function deleteCategoryRequest(params: {
  id: number;
}): Promise<AxiosResponse<TSuccess<null>>> {
  return api.delete(`/inventory/category/${params.id}`);
}

export async function getCategoryRequest(params: {
  id: number;
}): Promise<AxiosResponse<TSuccess<TCategory>>> {
  return api.get(`/inventory/category/${params.id}`);
}

export async function getAllCategoriesRequest({
  query = "",
  status = "active",
  limit = 20,
  page = 1,
}: TCategoryQuery): Promise<
  AxiosResponse<TSuccess<PaginatedListResponse<TCategory[]>>>
> {
  return api.get(
    `/inventory/category/list?${new URLSearchParams({
      query: query || "",
      status: status || "",
      limit: limit.toString(),
      page: page.toString(),
    }).toString()}`,
  );
}
