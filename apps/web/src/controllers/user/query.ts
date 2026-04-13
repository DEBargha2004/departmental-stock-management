import { useQuery } from "@tanstack/react-query";
import { getAllUsersRequest } from "./api";
import type { TUserQuery } from "@repo/contracts/query";

export const useGetAllUsersQuery = ({
  query,
  role,
  limit,
  page,
  status,
}: TUserQuery) => {
  return useQuery({
    queryKey: ["users", query, role, limit, page, status],
    queryFn: () => getAllUsersRequest({ query, role, limit, page, status }),
  });
};
