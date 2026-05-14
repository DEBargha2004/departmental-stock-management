import { useQuery } from "@tanstack/react-query";
import { getPermissionsRequest, getAccessListRequest } from "./api";

export function useGetAccessListQuery() {
  return useQuery({
    queryKey: ["access-list"],
    queryFn: getAccessListRequest,
  });
}

export function useGetPermissionsQuery() {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: getPermissionsRequest,
  });
}
