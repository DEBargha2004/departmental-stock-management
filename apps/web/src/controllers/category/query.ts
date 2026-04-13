import { useQuery } from "@tanstack/react-query";
import { getAllCategoriesRequest } from "./api";
import type { TCategoryQuery } from "@repo/contracts/query";

export const useGetAllCategoriesQuery = ({
  query,
  status,
  limit,
  page,
}: TCategoryQuery) => {
  return useQuery({
    queryKey: ["categories", query, status, limit, page],
    queryFn: () =>
      getAllCategoriesRequest({
        query,
        status,
        limit,
        page,
      }),
  });
};
