import { api } from "@/lib/axios";
import type { PaginatedListResponse } from "@/types/list-response";
import type { TSuccess } from "@/types/response";
import type { TAuditLogQuery } from "@repo/contracts/query";
import type { AxiosResponse } from "axios";
import type { TAuditLog } from "@repo/contracts/audit";

export async function getAuditLogsRequest({
  query = "",
  action,
  entity,
  limit,
  page,
}: TAuditLogQuery): Promise<
  AxiosResponse<TSuccess<PaginatedListResponse<TAuditLog[]>>>
> {
  return api.get(`/audit`, {
    params: {
      query,
      action,
      entity,
      limit,
      page,
    },
  });
}
