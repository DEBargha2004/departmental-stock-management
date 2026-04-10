import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createUserRequest,
  updateUserRequest,
  deleteUserRequest,
} from "@/controllers/user/api";
import { toast } from "sonner";

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserRequest,
    onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`User ${data?.data.data?.name} created successfully`);
    },
    onError(error) {
      toast.error(error.message);
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserRequest,
    onSettled(data) {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`User ${data?.data.data?.name} updated successfully`);
    },
    onError(error) {
      toast.error(error.message);
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserRequest,
    onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(data.data.message);
    },
    onError(error) {
      toast.error(error.message);
    },
  });
};
