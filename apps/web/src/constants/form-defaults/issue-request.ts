import type { TIssueRequestCreateSchema } from "@repo/contracts/circulation";

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
