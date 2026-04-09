import { useQuery } from "@tanstack/react-query";
import { getAllUsersRequest } from "./api";

export const useGetAllUsersQuery = ({
  query,
  role,
  limit,
  page,
}: {
  query: string;
  role: string;
  limit: number;
  page: number;
}) => {
  return useQuery({
    queryKey: ["users", query, role, limit, page],
    queryFn: () => getAllUsersRequest(query, role, limit, page),
  });
};
