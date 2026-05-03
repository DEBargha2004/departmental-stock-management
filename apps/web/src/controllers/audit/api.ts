import { API_URL } from "@/constants/api";
import { api } from "@/lib/axios";
import type { PaginatedListResponse } from "@/types/list-response";
import type { TSuccess } from "@/types/response";
import type { TAuditLogQuery } from "@repo/contracts/query";
import type { AUDIT_ACTION, AUDIT_STATUS, ENTITY_TYPE } from "@repo/contracts/status";
import type { AxiosResponse } from "axios";

export type TAuditLog = {
  id: number;
  action: AUDIT_ACTION;
  entityType: ENTITY_TYPE;
  description: string | null;
  status: AUDIT_STATUS;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
};

export async function getAuditLogsRequest({
  query = "",
  action,
  entity,
  status,
  limit,
  page,
}: TAuditLogQuery): Promise<
  AxiosResponse<TSuccess<PaginatedListResponse<TAuditLog[]>>>
> {
  return api.get(
    `${API_URL}/audit?${new URLSearchParams({
      query,
      ...(action && { action }),
      ...(entity && { entity }),
      ...(status && { status }),
      limit: limit.toString(),
      page: page.toString(),
    }).toString()}`,
  );
}
