import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createItemRequest, deleteItemRequest, updateItemRequest } from "./api";
import { toast } from "sonner";

export const useCreateItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createItemRequest,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success(res.data.message);
    },
  });
};

export const useUpdateItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateItemRequest,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success(res.data.message);
    },
  });
};

export const useDeleteItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteItemRequest,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success(res.data.message);
    },
  });
};
