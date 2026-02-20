import z from "zod";

export const createUserSchema = z
  .object({
    name: z.string().nonempty(),
    email: z.email(),
    password: z.string(),
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

export type TCreateUser = z.infer<typeof createUserSchema>;
