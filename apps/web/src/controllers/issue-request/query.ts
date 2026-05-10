import type { TIssueRequestQuery } from "@repo/contracts/query";
import { useQuery } from "@tanstack/react-query";
import { getAllIssueRequestsRequest } from "./api";

export function useGetAllIssueRequestsQuery({
  query,
  limit,
  page,
}: TIssueRequestQuery) {
  return useQuery({
    queryKey: ["issue-requests", query, limit, page],
    queryFn: () =>
      getAllIssueRequestsRequest({
        query,
        limit,
        page,
      }),
  });
}
