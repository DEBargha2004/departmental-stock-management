import z from "zod";
import { ROLES } from "./auth/roles.js";

export const userCreateSchema = z.object({
  name: z.string().nonempty(),
  email: z.email(),
  role: z.enum(ROLES),
  password: z.string().nonempty(),
});

export const userUpdateSchema = z.object({
  name: z.string(),
  email: z.email(),
});

export type TUserCreateSchema = z.infer<typeof userCreateSchema>;
export type TUserUpdateSchema = z.infer<typeof userUpdateSchema>;
