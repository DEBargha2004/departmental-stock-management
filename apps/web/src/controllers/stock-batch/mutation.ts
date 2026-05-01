import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createStockBatchRequest,
  deleteStockBatchRequest,
  updateStockBatchRequest,
} from "./api";

export function useCreateStockBatchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStockBatchRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-batches"] });
    },
  });
}

export function useUpdateStockBatchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStockBatchRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-batches"] });
      queryClient.invalidateQueries({ queryKey: ["stock-batch"] });
    },
  });
}

export function useDeleteStockBatchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStockBatchRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-batches"] });
    },
  });
}
