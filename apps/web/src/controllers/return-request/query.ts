import type { TReturnRequestQuery } from "@repo/contracts/query";
import { useQuery } from "@tanstack/react-query";
import { getAllReturnRequestsRequest } from "./api";

export function useGetAllReturnRequestsQuery({
  query,
  limit,
  page,
}: TReturnRequestQuery) {
  return useQuery({
    queryKey: ["return-requests", query, limit, page],
    queryFn: () =>
      getAllReturnRequestsRequest({
        query,
        limit,
        page,
      }),
  });
}
