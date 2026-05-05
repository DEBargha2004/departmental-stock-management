export const MODULE = {
  DASHBOARD: "dashboard",
  USERS: "users",
  CATEGORIES: "categories",
  PRODUCTS: "products",
  VENDORS: "vendors",
  PURCHASE_ORDERS: "purchase_orders",
  STOCK_BATCHES: "stock_batches",
  ACTIVITY_LOG: "activity_log",
} as const;

export type MODULE = (typeof MODULE)[keyof typeof MODULE];
export const MODULE_LIST = Object.values(MODULE);
