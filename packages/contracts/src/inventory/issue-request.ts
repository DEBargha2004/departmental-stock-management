import { z } from "zod";

export const issueRequestCreateSchema = z
  .object({
    userId: z.coerce
      .number<number>()
      .int("User ID must be present")
      .nonnegative("User ID must be present"),
    issueDate: z.coerce.date<Date>().nonoptional("Issue date is required"),
    items: z
      .array(
        z.object({
          itemId: z.coerce.number<number>().nonnegative(),
          quantity: z.coerce
            .number<number>()
            .int("Quantity must be an integer")
            .nonnegative("Quantity must be non-negative"),
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

export const issueRequestUpdateSchema = issueRequestCreateSchema;

export type TIssueRequestCreateSchema = z.infer<
  typeof issueRequestCreateSchema
>;
export type TIssueRequestUpdateSchema = z.infer<
  typeof issueRequestUpdateSchema
>;
