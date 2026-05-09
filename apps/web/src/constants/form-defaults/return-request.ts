import type { TReturnRequestCreateSchema } from "@repo/contracts/return-request";

export const getDefaultReturnRequestCreateValues =
  (): TReturnRequestCreateSchema => ({
    returnDate: new Date(),
    items: [getDefaultReturnRequestItemValues()],
  });

export const getDefaultReturnRequestItemValues =
  (): TReturnRequestCreateSchema["items"][number] => ({
    itemId: -1,
    quantityReturned: 0,
    quantityDamaged: 0,
    reason: "",
  });
