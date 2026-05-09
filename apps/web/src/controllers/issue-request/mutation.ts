import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createIssueRequestRequest,
  deleteIssueRequestRequest,
  updateIssueRequestRequest,
} from "./api";

export function useCreateIssueRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createIssueRequestRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issue-requests"] });
    },
  });
}

export function useUpdateIssueRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateIssueRequestRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issue-requests"] });
    },
  });
}

export function useDeleteIssueRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteIssueRequestRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issue-requests"] });
    },
  });
}
