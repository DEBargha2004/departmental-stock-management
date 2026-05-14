import type { TReturnRequestCreateSchema } from "@repo/contracts/circulation";

export const getDefaultReturnRequestCreateValues =
  (): TReturnRequestCreateSchema => ({
    issueRequestId: -1,
    returnDate: new Date(),
    items: [getDefaultReturnRequestItemValues()],
  });

export const getDefaultReturnRequestItemValues =
  (): TReturnRequestCreateSchema["items"][number] => ({
    issueItemId: -1,
    quantityReceived: 0,
    quantityDamaged: 0,
    reason: "",
  });
