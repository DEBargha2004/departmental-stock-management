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
