import type { TStockBatchCreateSchema } from "@repo/contracts/stock-batch";

export const getDefaultStckBatchCreateValues = (): TStockBatchCreateSchema => ({
  purchaseOrderId: -1,
  purchaseItems: [getDefaultStockBatchPurchaseItemValues()],
});

export const getDefaultStockBatchPurchaseItemValues =
  (): TStockBatchCreateSchema["purchaseItems"][number] => ({
    purchaseItemId: -1,
    quantityReceived: 0,
  });
