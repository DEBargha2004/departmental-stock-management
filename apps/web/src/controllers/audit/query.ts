import { useQuery } from "@tanstack/react-query";
import { getAuditLogsRequest } from "./api";
import type { TAuditLogQuery } from "@repo/contracts/query";

export const useGetAuditLogsQuery = ({
  query,
  action,
  entity,

  limit,
  page,
}: TAuditLogQuery) => {
  return useQuery({
    queryKey: ["audit-logs", query, action, entity, limit, page],
    queryFn: () => getAuditLogsRequest({ query, action, entity, limit, page }),
  });
};
