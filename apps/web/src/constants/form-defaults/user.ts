import type {
  TUserCreateSchema,
  TUserUpdateSchema,
} from "@repo/contracts/user";

export const getDefaultUserCreateValues = (): TUserCreateSchema => ({
  name: "",
  email: "",
  password: "",
  role: "faculty",
});

export const getDefaultUserUpdateValues = (): TUserUpdateSchema => ({
  name: "",
  email: "",
  role: "student",
});
