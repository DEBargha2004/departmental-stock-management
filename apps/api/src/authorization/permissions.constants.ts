export const PERMISSIONS = {
  VENDOR_CREATE: 'vendor.create',
  VENDOR_READ: 'vendor.read',
  VENDOR_UPDATE: 'vendor.update',
  VENDOR_DELETE: 'vendor.delete',

  PRODUCT_CREATE: 'product.create',
  PRODUCT_READ: 'product.read',
  PRODUCT_UPDATE: 'product.update',
  PRODUCT_DELETE: 'product.delete',

  USER_CREATE: 'user.create',
  USER_READ: 'user.read',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',

  AUTH_CREATE: 'auth.create',
  AUTH_UPDATE: 'auth.update',
  AUTH_DELETE: 'auth.delete',

  CATEGORY_CREATE: 'category.create',
  CATEGORY_READ: 'category.read',
  CATEGORY_UPDATE: 'category.update',
  CATEGORY_DELETE: 'category.delete',

  STOCK_CREATE: 'stock.create',
  STOCK_READ: 'stock.read',
  STOCK_UPDATE: 'stock.update',
  STOCK_DELETE: 'stock.delete',

  PURCHASE_ORDER_CREATE: 'purchase-order.create',
  PURCHASE_ORDER_READ: 'purchase-order.read',
  PURCHASE_ORDER_UPDATE: 'purchase-order.update',
  PURCHASE_ORDER_DELETE: 'purchase-order.delete',

  STOCK_BATCH_CREATE: 'stock-batch.create',
  STOCK_BATCH_READ: 'stock-batch.read',
  STOCK_BATCH_UPDATE: 'stock-batch.update',
  STOCK_BATCH_DELETE: 'stock-batch.delete',

  AUDIT_READ: 'audit.read',

  ISSUE_REQUEST_CREATE: 'issue-request.create',
  ISSUE_REQUEST_READ: 'issue-request.read',
  ISSUE_REQUEST_UPDATE: 'issue-request.update',
  ISSUE_REQUEST_DELETE: 'issue-request.delete',

  RETURN_REQUEST_CREATE: 'return-request.create',
  RETURN_REQUEST_READ: 'return-request.read',
  RETURN_REQUEST_UPDATE: 'return-request.update',
  RETURN_REQUEST_DELETE: 'return-request.delete',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_LIST = Object.values(PERMISSIONS);
