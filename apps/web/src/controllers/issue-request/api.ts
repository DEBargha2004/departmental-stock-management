import type { PaginatedListResponse } from "@/types/list-response";
import type { TSuccess } from "@/types/response";
import type { TIssueRequestQuery } from "@repo/contracts/query";
import type { AxiosResponse } from "axios";
import type {
  TIssueRequestCreateSchema,
  TIssueRequestUpdateSchema,
} from "@repo/contracts/issue-request";
import { api } from "@/lib/axios";
import type { TUser } from "../user/api";

export type TIssueRequest = {
  id: number;
  issueDate: Date;
  user: TUser;
  items: TIssueRequestItem[];
};

export type TIssueRequestItem = {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
  };
};

export async function createIssueRequestRequest(
  data: TIssueRequestCreateSchema,
): Promise<AxiosResponse<TSuccess<null>>> {
  return api.post("/inventory/issue-request/create", data);
}

export async function updateIssueRequestRequest({
  id,
  payload,
}: {
  id: number;
  payload: TIssueRequestUpdateSchema;
}): Promise<AxiosResponse<TSuccess<null>>> {
  return api.patch(`/inventory/issue-request/${id}`, payload);
}

export async function deleteIssueRequestRequest({
  id,
}: {
  id: number;
}): Promise<AxiosResponse<TSuccess<null>>> {
  return api.delete(`/inventory/issue-request/${id}`);
}

export async function getIssueRequestRequest({ id }: { id: number }): Promise<
  AxiosResponse<
    TSuccess<{
      request: TIssueRequest;
    }>
  >
> {
  return api.get(`/inventory/issue-request/${id}`);
}

export async function getAllIssueRequestsRequest({
  query = "",
  limit,
  page,
}: TIssueRequestQuery): Promise<
  AxiosResponse<TSuccess<PaginatedListResponse<TIssueRequest[]>>>
> {
  return api.get("/inventory/issue-request", {
    params: {
      query,
      limit,
      page,
    },
  });
}
