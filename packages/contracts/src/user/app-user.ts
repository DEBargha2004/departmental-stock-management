// for user created by admin

import z from "zod";

export const createAppUser = z.object({
  name: z.string().nonempty(),
  email: z.email(),
  password: z.string().min(8),
  role: z.array(z.string()),
});

export type TCreateAppUser = z.infer<typeof createAppUser>;
