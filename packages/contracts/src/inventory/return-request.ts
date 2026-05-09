import { z } from "zod";

export const returnRequestCreateSchema = z
  .object({
    issueRequestId: z.coerce.number<number>().nonnegative(),
    returnDate: z.coerce.date<Date>().nonoptional("Return date is required"),

    items: z
      .array(
        z.object({
          itemId: z.coerce.number<number>().nonnegative(),
          quantityReturned: z.coerce.number<number>().nonnegative(),
          quantityDamaged: z.coerce.number<number>().optional(),
          reason: z.string().optional(),
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

    appearances.forEach((indices) => {
      if (indices.length > 1) {
        ctx.addIssue({
          code: "custom",
          message: "Duplicate items are not allowed",
          path: [`items.${indices[1]}.itemId`],
        });
      }
    });
  });

export const returnRequestUpdateSchema = returnRequestCreateSchema;

export type TReturnRequestCreateSchema = z.infer<
  typeof returnRequestCreateSchema
>;
export type TReturnRequestUpdateSchema = z.infer<
  typeof returnRequestUpdateSchema
>;
