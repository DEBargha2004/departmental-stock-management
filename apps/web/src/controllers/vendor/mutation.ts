import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createVendorRequest,
  deleteVendorRequest,
  updateVendorRequest,
} from "./api";
import { toast } from "sonner";

export const useCreateVendorMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVendorRequest,
    onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success(`Vendor ${data?.data.data?.name} created successfully`);
    },
    onError(error) {
      toast.error(error.message);
    },
  });
};

export const useUpdateVendorMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateVendorRequest,
    onSettled(data) {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success(`Vendor ${data?.data.data?.name} updated successfully`);
    },
    onError(error) {
      toast.error(error.message);
    },
  });
};

export const useDeleteVendorMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVendorRequest,
    onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success(data.data.message);
    },
    onError(error) {
      toast.error(error.message);
    },
  });
};
