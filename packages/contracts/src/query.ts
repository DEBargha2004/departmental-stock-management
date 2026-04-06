import z from "zod";

export const query = z.object({
  query: z.coerce.string<string>().optional().default(""),
  limit: z.coerce.number<number>().default(20),
});

export type TQuery = z.infer<typeof query>;
