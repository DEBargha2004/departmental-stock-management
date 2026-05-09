import type { TIssueRequestCreateSchema } from "@repo/contracts/issue-request";

export const getDefaultIssueRequestCreateValues =
  (): TIssueRequestCreateSchema => ({
    userId: -1,
    issueDate: new Date(),
    items: [getDefaultIssueRequestItemValues()],
  });

export const getDefaultIssueRequestItemValues = () => ({
  itemId: null as unknown as number,
  quantity: 1,
});
