import z from "zod";

export const resetPasswordSchema = z
  .object({
    code: z.string().nonempty(),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword)
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Password and Confirm Password should match",
      });
  });

export type TResetPassword = z.infer<typeof resetPasswordSchema>;
