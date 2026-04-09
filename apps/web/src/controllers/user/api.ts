import { API_URL } from "@/constants/api";
import { api } from "@/lib/axios";
import type { PaginatedListResponse } from "@/types/list-response";
import type { TSuccess } from "@/types/response";
import type { Role } from "@repo/contracts/roles";
import type { TUserCreateSchema } from "@repo/contracts/user";
import type { AxiosResponse } from "axios";

type TUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

export async function createUserRequest(
  data: TUserCreateSchema,
): Promise<AxiosResponse<TSuccess<TUser>>> {
  return api.post(`${API_URL}/user-management/create`, data);
}

export async function updateUserRequest(params: {
  id: number;
  payload: TUserCreateSchema;
}): Promise<AxiosResponse<TSuccess<TUser>>> {
  return api.put(
    `${API_URL}/user-management/edit/${params.id}`,
    params.payload,
  );
}

export async function deleteUserRequest(params: {
  id: number;
}): Promise<AxiosResponse<TSuccess<null>>> {
  return api.delete(`${API_URL}/user-management/${params.id}`);
}

export async function getUserRequest(params: {
  id: number;
}): Promise<AxiosResponse<TSuccess<TUser & { password: string }>>> {
  return api.get(`${API_URL}/user/${params.id}`);
}

export async function getAllUsersRequest(
  query: string,
  role: string,
  limit: number,
  page: number,
): Promise<AxiosResponse<TSuccess<PaginatedListResponse<TUser[]>>>> {
  return api.get(
    `${API_URL}/user/list?query=${query}&role=${role}&limit=${limit}&page=${page}`,
  );
}
