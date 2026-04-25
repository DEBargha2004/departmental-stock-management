import { z } from "zod";

export const purchaseOrderCreateSchema = z
  .object({
    vendorId: z.coerce.number<number>().nonnegative(),
    invoiceId: z.string().nonempty("Invoice ID is required"),
    orderDate: z.string().nonempty("Order date is required"),
    totalAmount: z.coerce.number<number>().nonnegative(),
    items: z
      .array(
        z.object({
          itemId: z.coerce.number<number>().nonnegative(),
          quantity: z.coerce.number<number>().nonnegative(),
          unitPrice: z.coerce.number<number>().nonnegative(),
        }),
      )
      .min(1, "At least one item is required"),
  })
  .superRefine((data, ctx) => {
    const itemIds = data.items.map((item) => item.itemId);
    const appearances = new Map<number, number[]>();

    itemIds.forEach((id, index) => {
      if (!appearances.has(id)) {
        appearances.set(id, []);
      }
      appearances.get(id)!.push(index);
    });

    appearances.forEach((indices, id) => {
      if (indices.length > 1) {
        ctx.addIssue({
          code: "custom",
          message: "Duplicate items are not allowed",
          path: [`items.${indices[1]}.itemId`],
        });
      }
    });
  });

export const purchaseOrderUpdateSchema = purchaseOrderCreateSchema;

export type TPurchaseOrderCreateSchema = z.infer<
  typeof purchaseOrderCreateSchema
>;
export type TPurchaseOrderUpdateSchema = z.infer<
  typeof purchaseOrderUpdateSchema
>;
