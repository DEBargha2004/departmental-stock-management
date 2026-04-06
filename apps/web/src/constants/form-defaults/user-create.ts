import type { TUserCreateSchema } from "@repo/contracts/user";

export const getDefaultUserCreateValues = (): TUserCreateSchema => ({
  name: "",
  email: "",
  password: "",
  role: "faculty",
});
