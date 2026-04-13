import z from "zod";

export const itemCreateSchema = z.object({
  name: z.string().min(3),
  imageUrl: z.string().optional(),
  categoryId: z.coerce.number<number>(),
  minStockLevel: z.coerce.number<number>(),
});

export type TItemCreateSchema = z.infer<typeof itemCreateSchema>;
