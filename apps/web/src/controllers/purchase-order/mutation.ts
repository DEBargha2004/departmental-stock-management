import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPurchaseOrderRequest,
  deletePurchaseOrderRequest,
  updatePurchaseOrderRequest,
} from "./api";
import { toast } from "sonner";

export function useCreatePurchaseOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPurchaseOrderRequest,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success(res.data.message);
    },
  });
}

export function useUpdatePurchaseOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePurchaseOrderRequest,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success(res.data.message);
    },
  });
}

export function useDeletePurchaseOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePurchaseOrderRequest,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success(res.data.message);
    },
  });
}
