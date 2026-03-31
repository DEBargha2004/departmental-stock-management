import * as z from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(3),
});

export type TCategoryCreateSchema = z.infer<typeof categoryCreateSchema>;
