export const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export const PRODUCT_STATUS = {
  IN_STOCK: "in_stock",
  LOW_STOCK: "low_stock",
  OUT_OF_STOCK: "out_of_stock",
} as const;

export const PURCHASE_ORDER_STATUS = {
  ORDERED: "ordered",
  RECEIVED: "received",
  CANCELLED: "cancelled",
  PARTIALLY_RECEIVED: "partially_received",
} as const;

export const STATUS_LIST = Object.values(STATUS);
export const PRODUCT_STATUS_LIST = Object.values(PRODUCT_STATUS);
export const PURCHASE_ORDER_STATUS_LIST = Object.values(PURCHASE_ORDER_STATUS);

export const STATUS_FORMATTED = [
  {
    id: "active",
    label: "Active",
  },
  {
    id: "inactive",
    label: "Inactive",
  },
] as const satisfies { id: STATUS; label: string }[];

export const PRODUCT_STATUS_FORMATTED = [
  {
    id: "in_stock",
    label: "In Stock",
  },
  {
    id: "low_stock",
    label: "Low Stock",
  },
  {
    id: "out_of_stock",
    label: "Out of Stock",
  },
] as const satisfies { id: PRODUCT_STATUS; label: string }[];

export const PURCHASE_ORDER_STATUS_FORMATTED = [
  {
    id: "ordered",
    label: "Ordered",
  },
  {
    id: "received",
    label: "Received",
  },
  {
    id: "cancelled",
    label: "Cancelled",
  },
  {
    id: "partially_received",
    label: "Partially Received",
  },
] as const satisfies { id: PURCHASE_ORDER_STATUS; label: string }[];

export const getStatusObject = (status: STATUS) => {
  return STATUS_FORMATTED.find((s) => s.id === status)!;
};

export const getProductStatusObject = (status: PRODUCT_STATUS) => {
  return PRODUCT_STATUS_FORMATTED.find((s) => s.id === status)!;
};

export const getPurchaseOrderStatusObject = (status: PURCHASE_ORDER_STATUS) => {
  return PURCHASE_ORDER_STATUS_FORMATTED.find((s) => s.id === status)!;
};

export type STATUS = (typeof STATUS)[keyof typeof STATUS];
export type PRODUCT_STATUS =
  (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];
export type MOVEMENT_TYPE = "ISSUE" | "RETURN" | "DAMAGE" | "ADJUSTMENT";
export type PURCHASE_ORDER_STATUS =
  (typeof PURCHASE_ORDER_STATUS)[keyof typeof PURCHASE_ORDER_STATUS];
