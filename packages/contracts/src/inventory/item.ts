import z from "zod";
import { status } from "./status.js";

export const itemCreateSchema = z.object({
  name: z.string().min(3),
  imageUrl: z.string().optional(),
  categoryId: z.coerce.number<number>(),
  status: z.enum(status),
  minStockLevel: z.coerce.number<number>(),
});

export type TItemCreateSchema = z.infer<typeof itemCreateSchema>;
