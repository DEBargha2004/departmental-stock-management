import z from "zod";

export const filter = z
  .object({
    query: z.string().optional(),
    limit: z.coerce.number<number>().optional(),
    offset: z.coerce.number<number>().optional(),
  })
  .optional();

export type TFilter = z.infer<typeof filter>;
