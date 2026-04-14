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
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_LIST = Object.values(PERMISSIONS);
