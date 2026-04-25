import type { TPurchaseOrderQuery } from "@repo/contracts/query";
import { useQuery } from "@tanstack/react-query";
import { getAllPurchaseOrdersRequest } from "./api";

export function useGetAllPurchaseOrdersQuery({
  query,
  limit,
  page,
  status,
  vendorId,
}: TPurchaseOrderQuery) {
  return useQuery({
    queryKey: ["purchase-orders", query, limit, page, status, vendorId],
    queryFn: () =>
      getAllPurchaseOrdersRequest({
        query,
        limit,
        page,
        status,
        vendorId,
      }),
  });
}
