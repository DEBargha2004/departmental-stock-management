import type { TStockBatchQuery } from "@repo/contracts/query";
import { useQuery } from "@tanstack/react-query";
import { getAllStockBatchesRequest } from "./api";

export function useGetAllStockBatchesQuery({
  query,
  limit,
  page,
  vendorId,
}: TStockBatchQuery) {
  return useQuery({
    queryKey: ["stock-batches", query, limit, page, vendorId],
    queryFn: () =>
      getAllStockBatchesRequest({
        query,
        limit,
        page,
        vendorId,
      }),
  });
}
