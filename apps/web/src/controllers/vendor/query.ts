import type { TVendorQuery } from "@repo/contracts/query";
import { useQuery } from "@tanstack/react-query";
import { getAllVendorsRequest } from "./api";

export function useGetAllVendorsQuery({
  query,
  limit,
  page,
  status,
}: TVendorQuery) {
  return useQuery({
    queryKey: ["vendors", query, limit, page, status],
    queryFn: () =>
      getAllVendorsRequest({
        query,
        limit,
        page,
        status,
      }),
  });
}
