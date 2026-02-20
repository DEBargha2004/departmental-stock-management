import z from "zod";

export const resetPasswordSchema = z
  .object({
    code: z.string().nonempty(),
    password: z.string().nonempty(),
    confirmPassword: z.string().nonempty(),
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
