import type { TPurchaseOrderCreateSchema } from "@repo/contracts/purchase-order";

export const getDefaultPurchaseOrderCreateValues =
  (): TPurchaseOrderCreateSchema => ({
    vendorId: 0,
    orderDate: new Date().toISOString().split("T")[0],
    expectedDeliveryDate: "",
    items: [
      {
        itemId: 0,
        quantity: 1,
        unitPrice: 0,
      },
    ],
    notes: "",
  });
