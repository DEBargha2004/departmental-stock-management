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
} as const;





export const MOVEMENT_TYPE = {
  ISSUE: "issue",
  RETURN: "return",
  DAMAGE: "damage",
  ADJUSTMENT: "adjustment",
  NEW_STOCK: "new_stock",
  STOCK_CORRECTION: "stock_correction",
  INITIAL: "initial",
} as const;

export const AUDIT_ACTION = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
} as const;

export const ENTITY_TYPE = {
  USER: "user",
  CATEGORIES: "categories",
  PRODUCT: "product",
  PURCHASE_ORDER: "purchase_order",
  STOCK_BATCH: "stock_batch",
  ISSUE_ITEM: "issue_item",
  RETURN_ITEM: "return_item",
  STOCK: "stock",
  VENDOR: "vendor",
  ISSUE_REQUEST: "issue_request",
  RETURN_REQUEST: "return_request",
} as const;

export const ACTOR_TYPE = {
  USER: "user",
  SYSTEM: "system",
} as const;

export type STATUS = (typeof STATUS)[keyof typeof STATUS];
export type PRODUCT_STATUS =
  (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];
export type MOVEMENT_TYPE = (typeof MOVEMENT_TYPE)[keyof typeof MOVEMENT_TYPE];
export type PURCHASE_ORDER_STATUS =
  (typeof PURCHASE_ORDER_STATUS)[keyof typeof PURCHASE_ORDER_STATUS];



export type AUDIT_ACTION = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];
export type ENTITY_TYPE = (typeof ENTITY_TYPE)[keyof typeof ENTITY_TYPE];
export type ACTOR_TYPE = (typeof ACTOR_TYPE)[keyof typeof ACTOR_TYPE];

export const STATUS_LIST = Object.values(STATUS);
export const PRODUCT_STATUS_LIST = Object.values(PRODUCT_STATUS);
export const PURCHASE_ORDER_STATUS_LIST = Object.values(PURCHASE_ORDER_STATUS);



export const MOVEMENT_TYPE_LIST = Object.values(MOVEMENT_TYPE);
export const AUDIT_ACTION_LIST = Object.values(AUDIT_ACTION);
export const ENTITY_TYPE_LIST = Object.values(ENTITY_TYPE);
export const ACTOR_TYPE_LIST = Object.values(ACTOR_TYPE);

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
] as const satisfies { id: PURCHASE_ORDER_STATUS; label: string }[];





export const MOVEMENT_TYPE_FORMATTED = [
  {
    id: "issue",
    label: "Issue",
  },
  {
    id: "return",
    label: "Return",
  },
  {
    id: "damage",
    label: "Damage",
  },
  {
    id: "adjustment",
    label: "Adjustment",
  },
  {
    id: "new_stock",
    label: "New Stock",
  },
  {
    id: "stock_correction",
    label: "Stock Correction",
  },
  {
    id: "initial",
    label: "Initial Stock",
  },
] as const satisfies { id: MOVEMENT_TYPE; label: string }[];

export const AUDIT_ACTION_FORMATTED = [
  {
    id: "create",
    label: "Create",
  },
  {
    id: "update",
    label: "Update",
  },
  {
    id: "delete",
    label: "Delete",
  },
] as const satisfies { id: AUDIT_ACTION; label: string }[];

export const ENTITY_TYPE_FORMATTED = [
  { id: "user", label: "User" },
  {
    id: "categories",
    label: "Categories",
  },
  {
    id: "product",
    label: "Product",
  },
  {
    id: "purchase_order",
    label: "Purchase Order",
  },
  {
    id: "stock_batch",
    label: "Stock Batch",
  },
  {
    id: "issue_item",
    label: "Issue Item",
  },
  {
    id: "return_item",
    label: "Return Item",
  },
  {
    id: "stock",
    label: "Stock",
  },
  {
    id: "vendor",
    label: "Vendor",
  },
  {
    id: "issue_request",
    label: "Issue Request",
  },
  {
    id: "return_request",
    label: "Return Request",
  },
] as const satisfies { id: ENTITY_TYPE; label: string }[];

export const ACTOR_TYPE_FORMATTED = [
  {
    id: "user",
    label: "User",
  },
  {
    id: "system",
    label: "System",
  },
] as const satisfies { id: ACTOR_TYPE; label: string }[];

export const getStatusObject = (status: STATUS) => {
  return STATUS_FORMATTED.find((s) => s.id === status)!;
};

export const getProductStatusObject = (status: PRODUCT_STATUS) => {
  return PRODUCT_STATUS_FORMATTED.find((s) => s.id === status)!;
};

export const getPurchaseOrderStatusObject = (status: PURCHASE_ORDER_STATUS) => {
  return PURCHASE_ORDER_STATUS_FORMATTED.find((s) => s.id === status)!;
};





export const getMovementTypeObject = (type: MOVEMENT_TYPE) => {
  return MOVEMENT_TYPE_FORMATTED.find((t) => t.id === type)!;
};

export const getAuditActionObject = (action: AUDIT_ACTION) => {
  return AUDIT_ACTION_FORMATTED.find((a) => a.id === action)!;
};

export const getEntityTypeObject = (entityType: ENTITY_TYPE) => {
  return ENTITY_TYPE_FORMATTED.find((e) => e.id === entityType)!;
};

export const getActorTypeObject = (actorType: ACTOR_TYPE) => {
  return ACTOR_TYPE_FORMATTED.find((e) => e.id === actorType)!;
};
