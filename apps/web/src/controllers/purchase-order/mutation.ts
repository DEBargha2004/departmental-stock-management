import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPurchaseOrderRequest,
  deletePurchaseOrderRequest,
  updatePurchaseOrderRequest,
} from "./api";

export function useCreatePurchaseOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPurchaseOrderRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
}

export function useUpdatePurchaseOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePurchaseOrderRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
}

export function useDeletePurchaseOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePurchaseOrderRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
}
