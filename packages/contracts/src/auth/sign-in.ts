import z from "zod";

export const signInSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export type TSignIn = z.infer<typeof signInSchema>;
