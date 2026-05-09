import type { PaginatedListResponse } from "@/types/list-response";
import type { TSuccess } from "@/types/response";
import type { TReturnRequestQuery } from "@repo/contracts/query";
import type { AxiosResponse } from "axios";
import type {
  TReturnRequestCreateSchema,
  TReturnRequestUpdateSchema,
} from "@repo/contracts/return-request";
import { api } from "@/lib/axios";

export type TReturnRequest = {
  id: number;
  returnDate: Date;
  reason?: string;
  items: TReturnRequestItem[];
};

export type TReturnRequestItem = {
  id: number;
  quantityReturned: number;
  quantityDamaged?: number;
  reason?: string;
  product: {
    id: number;
    name: string;
  };
};

export async function createReturnRequestRequest(
  data: TReturnRequestCreateSchema,
): Promise<AxiosResponse<TSuccess<null>>> {
  return api.post("/inventory/return-request/create", data);
}

export async function updateReturnRequestRequest({
  id,
  payload,
}: {
  id: number;
  payload: TReturnRequestUpdateSchema;
}): Promise<AxiosResponse<TSuccess<null>>> {
  return api.patch(`/inventory/return-request/${id}`, payload);
}

export async function deleteReturnRequestRequest({
  id,
}: {
  id: number;
}): Promise<AxiosResponse<TSuccess<null>>> {
  return api.delete(`/inventory/return-request/${id}`);
}

export async function getReturnRequestRequest({ id }: { id: number }): Promise<
  AxiosResponse<
    TSuccess<{
      request: TReturnRequest;
    }>
  >
> {
  return api.get(`/inventory/return-request/${id}`);
}

export async function getAllReturnRequestsRequest({
  query = "",
  limit,
  page,
}: TReturnRequestQuery): Promise<
  AxiosResponse<TSuccess<PaginatedListResponse<TReturnRequest[]>>>
> {
  return api.get("/inventory/return-request/list", {
    params: {
      query,
      limit,
      page,
    },
  });
}
