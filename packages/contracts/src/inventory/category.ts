import * as z from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
});

export type TCategoryCreateSchema = z.infer<typeof categoryCreateSchema>;

export const categoryUpdateSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
});

export type TCategoryUpdateSchema = z.infer<typeof categoryUpdateSchema>;

export type TCategory = {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  itemsCount: number;
};
