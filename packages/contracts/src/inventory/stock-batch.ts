import z from "zod";

export const stockBatchCreateSchema = z.object({
  batchNumber: z.string(),
  purchaseOrderId: z.number(),
  arrivalDate: z.coerce.date<Date>(),
  purchaseItems: z.array(
    z.object({
      purchaseItemId: z.number(),
      quantityReceived: z.number(),
    }),
  ),
});

export const stockBatchUpdateSchema = stockBatchCreateSchema;

export type TStockBatchCreateSchema = z.infer<typeof stockBatchCreateSchema>;
export type TStockBatchUpdateSchema = z.infer<typeof stockBatchUpdateSchema>;

export type TStockBatchItem = {
  id: number;
  purchaseOrderItemId: number;
  product: {
    id: number;
    name: string;
  };
  quantity: number;
  unitPrice: number;
};

export type TStockBatch = {
  id: number;
  batchNumber: string;
  purchaseOrder: {
    id: number;
    invoiceId: string;
    totalAmount: number;
    status: string;
    orderDate: Date;
  };
  vendor: {
    id: number;
    name: string;
  };
  arrivalDate: string;
  items: TStockBatchItem[];
};
