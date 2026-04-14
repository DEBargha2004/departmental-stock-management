import z from "zod";

export const productSchema = z.object({
  name: z.string().min(3).optional(),
  imageUrl: z.string().optional(),
  categoryId: z.coerce.number<number>().optional(),
  minStockLevel: z.coerce.number<number>().optional(),
  price: z.coerce.number<number>().nonnegative().nonoptional(),
});

export const productCreateSchema = productSchema.extend({
  currentStock: z.coerce.number<number>().optional(),
});

export const productUpdateSchema = productSchema;

export type TProductCreateSchema = z.infer<typeof productCreateSchema>;
export type TProductUpdateSchema = z.infer<typeof productUpdateSchema>;
