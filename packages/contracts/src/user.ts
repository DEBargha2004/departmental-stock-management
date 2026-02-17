import z from "zod";

export const userCreateSchema = z
  .object({
    name: z.string().nonempty(),
    email: z.email(),
    password: z.string().nonempty(),
    confirmPassword: z.string().nonempty(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Password and Confirm Password does not match",
        path: ["confirmPassword"],
      });
    }
  });

export const userUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.email().optional(),
});

export type TUserCreateSchema = z.infer<typeof userCreateSchema>;
export type TUserUpdateSchema = z.infer<typeof userUpdateSchema>;
