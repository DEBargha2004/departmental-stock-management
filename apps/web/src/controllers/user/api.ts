import { api } from "@/lib/axios";
import type { PaginatedListResponse } from "@/types/list-response";
import type { TSuccess } from "@/types/response";

import type {
  TUserCreateSchema,
  TUserUpdateSchema,
  TUser,
} from "@repo/contracts/user";
import type { AxiosResponse } from "axios";
import type { TUserQuery } from "@repo/contracts/query";



export async function createUserRequest(
  data: TUserCreateSchema,
): Promise<AxiosResponse<TSuccess<TUser>>> {
  return api.post(`/user-management/create`, data);
}

export async function updateUserRequest(params: {
  id: number;
  payload: TUserUpdateSchema;
}): Promise<AxiosResponse<TSuccess<TUser>>> {
  return api.patch(`/user-management/${params.id}`, params.payload);
}

export async function deleteUserRequest(params: {
  id: number;
}): Promise<AxiosResponse<TSuccess<null>>> {
  return api.delete(`/user-management/${params.id}`);
}

export async function getUserRequest(params: {
  id: number;
}): Promise<AxiosResponse<TSuccess<TUser & { password: string }>>> {
  return api.get(`/user/${params.id}`);
}

export async function getAllUsersRequest({
  query = "",
  role,
  status,
  limit,
  page,
}: TUserQuery): Promise<
  AxiosResponse<TSuccess<PaginatedListResponse<TUser[]>>>
> {
  return api.get(`/user/list`, {
    params: {
      query,
      role,
      status,
      limit,
      page,
    },
  });
}

