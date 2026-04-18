import type { TPurchaseOrderQuery } from "@repo/contracts/query";
import { useQuery } from "@tanstack/react-query";
import { getAllPurchaseOrdersRequest } from "./api";

export function useGetAllPurchaseOrdersQuery({
  query,
  limit,
  page,
  status,
}: TPurchaseOrderQuery) {
  return useQuery({
    queryKey: ["purchase-orders", query, limit, page, status],
    queryFn: () =>
      getAllPurchaseOrdersRequest({
        query,
        limit,
        page,
        status,
      }),
  });
}
