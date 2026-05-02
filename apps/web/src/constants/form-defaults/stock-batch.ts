import type { TStockBatchCreateSchema } from "@repo/contracts/stock-batch";

export const getDefaultStockBatchCreateValues = (): TStockBatchCreateSchema => ({
  batchNumber: "",
  purchaseOrderId: -1,
  arrivalDate: new Date(),
  purchaseItems: [getDefaultStockBatchPurchaseItemValues()],
});

export const getDefaultStockBatchPurchaseItemValues =
  (): TStockBatchCreateSchema["purchaseItems"][number] => ({
    purchaseItemId: -1,
    quantityReceived: 0,
  });
