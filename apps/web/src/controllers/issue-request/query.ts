import type { TIssueRequestQuery } from "@repo/contracts/query";
import { useQuery } from "@tanstack/react-query";
import { getAllIssueRequestsRequest } from "./api";

export function useGetAllIssueRequestsQuery({
  query,
  limit,
  page,
  status,
  requesterId,
}: TIssueRequestQuery) {
  return useQuery({
    queryKey: ["issue-requests", query, limit, page, status, requesterId],
    queryFn: () =>
      getAllIssueRequestsRequest({
        query,
        limit,
        page,
        status,
        requesterId,
      }),
  });
}
