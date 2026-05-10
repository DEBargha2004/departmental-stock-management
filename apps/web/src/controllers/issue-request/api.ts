import type { PaginatedListResponse } from "@/types/list-response";
import type { TSuccess } from "@/types/response";
import type { TIssueRequestQuery } from "@repo/contracts/query";
import type { AxiosResponse } from "axios";
import type {
  TIssueRequest,
  TIssueRequestCreateSchema,
  TIssueRequestUpdateSchema,
} from "@repo/contracts/circulation";
import { api } from "@/lib/axios";
import type { TUser } from "@repo/contracts/user";
import type { TProduct } from "@repo/contracts/item";

export async function createIssueRequestRequest(
  data: TIssueRequestCreateSchema,
): Promise<AxiosResponse<TSuccess<null>>> {
  return api.post("/inventory/circulation/issue-request", data);
}

export async function updateIssueRequestRequest({
  id,
  payload,
}: {
  id: number;
  payload: TIssueRequestUpdateSchema;
}): Promise<AxiosResponse<TSuccess<null>>> {
  return api.patch(`/inventory/circulation/issue-request/${id}`, payload);
}

export async function deleteIssueRequestRequest({
  id,
}: {
  id: number;
}): Promise<AxiosResponse<TSuccess<null>>> {
  return api.delete(`/inventory/circulation/issue-request/${id}`);
}

export async function getIssueRequestRequest({ id }: { id: number }): Promise<
  AxiosResponse<
    TSuccess<{
      request: TIssueRequest;
      list: {
        user: TUser;
        products: TProduct[];
      };
    }>
  >
> {
  return api.get(`/inventory/circulation/issue-request/${id}`);
}

export async function getAllIssueRequestsRequest({
  query = "",
  limit = 20,
  page = 1,
}: TIssueRequestQuery): Promise<
  AxiosResponse<TSuccess<PaginatedListResponse<TIssueRequest[]>>>
> {
  return api.get("/inventory/circulation/issue-request", {
    params: {
      query,
      limit,
      page,
    },
  });
}
