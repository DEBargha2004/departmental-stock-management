import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createReturnRequestRequest,
  deleteReturnRequestRequest,
  updateReturnRequestRequest,
} from "./api";

export function useCreateReturnRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReturnRequestRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["return-requests"] });
    },
  });
}

export function useUpdateReturnRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateReturnRequestRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["return-requests"] });
    },
  });
}

export function useDeleteReturnRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReturnRequestRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["return-requests"] });
    },
  });
}
