import { z } from "zod";

export const issueRequestCreateSchema = z
  .object({
    userId: z.coerce
      .number<number>()
      .int("User ID must be present")
      .nonnegative("User ID must be present"),
    issueDate: z.coerce
      .date<Date>()
      .nonoptional("Issue date is required")
      .refine((v) => new Date(v) <= new Date(), {
        message: "Issue date must be before or equal to the current date",
      }),
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

export const returnRequestCreateSchema = z
  .object({
    issueRequestId: z.coerce.number<number>().nonnegative(),
    returnDate: z.coerce
      .date<Date>()
      .nonoptional("Return date is required")
      .refine((v) => new Date(v) <= new Date(), {
        message: "Return date must be before or equal to the current date",
      }),

    items: z
      .array(
        z.object({
          issueItemId: z.coerce.number<number>().nonnegative(),
          quantityReturned: z.coerce.number<number>().nonnegative(),
          quantityDamaged: z.coerce.number<number>().optional(),
          reason: z.string().optional(),
        }),
      )
      .min(1, "At least one item is required"),
  })
  .superRefine((data, ctx) => {
    const issueItemIds = data.items.map((item) => item.issueItemId);
    const appearances = new Map<number, number[]>();

    issueItemIds.forEach((id, index) => {
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

export type TUserForCirculation = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type TProductForCirculation = {
  id: number;
  name: string;
};

export type TIssueRequestItem = {
  id: number;
  quantity: number;
  isConsumable: boolean;
  product: TProductForCirculation;
};

export type TIssueRequest = {
  id: number;
  issueCode: string;
  issueDate: Date;
  issuedBy: TUserForCirculation;
  issuedTo: TUserForCirculation;
  createdAt: Date;
  items: TIssueRequestItem[];
};

export type TReturnRequestItem = {
  id: number;
  issueItemId: number;
  quantityReceived: number;
  quantityDamaged: number;
  reason: string | null;
  product: TProductForCirculation;
};

export type TReturnRequest = {
  id: number;
  issueRequestId: number;
  returnDate: Date;
  createdAt: Date;
  items: TReturnRequestItem[];
};
