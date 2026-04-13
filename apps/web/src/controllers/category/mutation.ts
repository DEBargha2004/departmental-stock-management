import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCategoryRequest,
  deleteCategoryRequest,
  updateCategoryRequest,
} from "./api";
import { toast } from "sonner";

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategoryRequest,
    onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(`Category ${data?.data.data?.name} created successfully`);
    },
    onError(error) {
      toast.error(error.message);
    },
  });
};

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategoryRequest,
    onSettled(data) {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(`Category ${data?.data.data?.name} updated successfully`);
    },
    onError(error) {
      toast.error(error.message);
    },
  });
};

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategoryRequest,
    onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(data.data.message);
    },
    onError(error) {
      toast.error(error.message);
    },
  });
};
