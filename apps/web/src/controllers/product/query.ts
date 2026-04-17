import { useQuery } from "@tanstack/react-query";
import { getAllItemsRequest } from "./api";
import type { TProductQuery } from "@repo/contracts/query";

export const useGetAllItemsQuery = ({
  query,
  limit,
  page,
  status,
  category,
}: TProductQuery) => {
  return useQuery({
    queryKey: ["items", query, limit, page, status, category],
    queryFn: () =>
      getAllItemsRequest({
        query,
        limit,
        page,
        status,
        category,
      }),
  });
};
