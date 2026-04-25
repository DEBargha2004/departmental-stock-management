import type { TPurchaseOrderCreateSchema } from "@repo/contracts/purchase-order";

export const getDefaultPurchaseOrderCreateValues =
  (): TPurchaseOrderCreateSchema => ({
    vendorId: null as unknown as number,
    invoiceId: "",
    orderDate: new Date().toDateString(),
    totalAmount: 0,
    items: [getDefaultPurchaseOrderItemValues()],
  });

export const getDefaultPurchaseOrderItemValues = () => ({
  itemId: null as unknown as number,
  quantity: 1,
  unitPrice: 0,
});
