import { useQuery } from "@tanstack/react-query";
import { getAllUsersRequest } from "./api";

export const useGetAllUsersQuery = (query?: string) => {
  return useQuery({
    queryKey: ["users", query],
    queryFn: () => getAllUsersRequest(query),
  });
};
