import type { TProductCreateSchema } from "@repo/contracts/item";

export const getDefaultProductCreateValues = (): TProductCreateSchema => ({
  name: "",
  imageUrl: "",
  categoryId: 0,
  price: 0,
  minStockLevel: 0,
  currentStock: 0,
});
