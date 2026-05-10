import z from "zod";
import { ROLES, type Role } from "./auth/roles.js";

export const userCreateSchema = z.object({
  name: z.string().nonempty(),
  email: z.email(),
  role: z.enum(ROLES),
  password: z.string().nonempty(),
});

export const userUpdateSchema = z.object({
  name: z.string().nonempty(),
  email: z.email(),
  role: z.enum(ROLES),
});

export type TUserCreateSchema = z.infer<typeof userCreateSchema>;
export type TUserUpdateSchema = z.infer<typeof userUpdateSchema>;

export type TUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
};
