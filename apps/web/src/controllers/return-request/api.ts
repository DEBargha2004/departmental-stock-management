import type { PaginatedListResponse } from "@/types/list-response";
import type { TSuccess } from "@/types/response";
import type { TReturnRequestQuery } from "@repo/contracts/query";
import type { AxiosResponse } from "axios";
import type {
  TReturnRequest,
  TReturnRequestCreateSchema,
  TReturnRequestUpdateSchema,
} from "@repo/contracts/circulation";
import { api } from "@/lib/axios";

export async function createReturnRequestRequest(
  data: TReturnRequestCreateSchema,
): Promise<AxiosResponse<TSuccess<null>>> {
  return api.post("/inventory/circulation/return-request/create", data);
}

export async function updateReturnRequestRequest({
  id,
  payload,
}: {
  id: number;
  payload: TReturnRequestUpdateSchema;
}): Promise<AxiosResponse<TSuccess<null>>> {
  return api.patch(`/inventory/circulation/return-request/${id}`, payload);
}

export async function deleteReturnRequestRequest({
  id,
}: {
  id: number;
}): Promise<AxiosResponse<TSuccess<null>>> {
  return api.delete(`/inventory/circulation/return-request/${id}`);
}

export async function getReturnRequestRequest({ id }: { id: number }): Promise<
  AxiosResponse<
    TSuccess<{
      request: TReturnRequest;
    }>
  >
> {
  return api.get(`/inventory/circulation/return-request/${id}`);
}

export async function getAllReturnRequestsRequest({
  query = "",
  limit,
  page,
}: TReturnRequestQuery): Promise<
  AxiosResponse<TSuccess<PaginatedListResponse<TReturnRequest[]>>>
> {
  return api.get("/inventory/circulation/return-request", {
    params: {
      query,
      limit,
      page,
    },
  });
}
