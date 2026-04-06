import { useMutation } from "@tanstack/react-query";
import {
  createUserRequest,
  updateUserRequest,
  deleteUserRequest,
} from "@/controllers/user/api";

export const useCreateUserMutation = () =>
  useMutation({ mutationFn: createUserRequest });

export const useUpdateUserMutation = () =>
  useMutation({ mutationFn: updateUserRequest });

export const useDeleteUserMutation = () =>
  useMutation({ mutationFn: deleteUserRequest });
