import { useQuery } from "@tanstack/react-query";
import { getAccessListRequest } from "./api";

export function useGetAccessListQuery() {
  return useQuery({
    queryKey: ["access-list"],
    queryFn: getAccessListRequest,
  });
}
