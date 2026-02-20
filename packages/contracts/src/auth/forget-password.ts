import z from "zod";

export const forgetPasswordSchema = z.object({
  email: z.email("Invalid email"),
});

export type TForgetPassword = z.infer<typeof forgetPasswordSchema>;
