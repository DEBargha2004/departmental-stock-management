import z from "zod";

export const productSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  categoryId: z.coerce.number<number>().nonoptional(),
  minStockLevel: z.coerce.number<number>().optional(),
  isConsumable: z.boolean(),
  price: z.coerce.number<number>().nonnegative().nonoptional(),
});

export const productCreateSchema = productSchema.extend({
  currentStock: z.coerce.number<number>().optional(),
});

export const productUpdateSchema = productSchema;

export type TProductCreateSchema = z.infer<typeof productCreateSchema>;
export type TProductUpdateSchema = z.infer<typeof productUpdateSchema>;
