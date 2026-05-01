import z from "zod";

export const stockBatchCreateSchema = z.object({
  purchaseOrderId: z.number(),
  purchaseItems: z.array(
    z.object({
      purchaseItemId: z.number(),
      quantityReceived: z.number(),
    }),
  ),
});

export const stockBatchUpdateSchema = stockBatchCreateSchema.partial();

export type TStockBatchCreateSchema = z.infer<typeof stockBatchCreateSchema>;
export type TStockBatchUpdateSchema = z.infer<typeof stockBatchUpdateSchema>;
