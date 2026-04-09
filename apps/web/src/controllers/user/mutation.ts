import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createUserRequest,
  updateUserRequest,
  deleteUserRequest,
} from "@/controllers/user/api";

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserRequest,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserRequest,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUserRequest,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
