import { useQuery } from "@tanstack/react-query";
import { getAllUsersRequest } from "./api";

export const useGetAllUsersQuery = ({
  query = "",
  role = "",
  limit,
}: {
  query: string;
  role: string;
  limit: number;
}) => {
  return useQuery({
    queryKey: ["users", query, role, limit],
    queryFn: () => getAllUsersRequest(query, role, limit),
  });
};
