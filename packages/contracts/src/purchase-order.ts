import { z } from "zod";

export const purchaseOrderCreateSchema = z.object({
  vendorId: z.number().min(1, "Vendor is required"),
  invoiceId: z.string().min(1, "Invoice ID is required"),
  orderDate: z.string().min(1, "Order date is required"),

  items: z
    .array(
      z.object({
        itemId: z.number().min(1, "Item is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        unitPrice: z.number().min(0, "Unit price must be positive"),
      }),
    )
    .min(1, "At least one item is required"),
});

export const purchaseOrderUpdateSchema = purchaseOrderCreateSchema.partial();

export type TPurchaseOrderCreateSchema = z.infer<
  typeof purchaseOrderCreateSchema
>;
export type TPurchaseOrderUpdateSchema = z.infer<
  typeof purchaseOrderUpdateSchema
>;
