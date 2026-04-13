import type { TCategoryCreateSchema } from "@repo/contracts/category";

export const getDefaultCategoryCreateValues = (): TCategoryCreateSchema => ({
  name: "",
  description: "",
});
