export const PERMISSIONS = {
  VENDOR_CREATE: 'vendor.create',
  VENDOR_READ: 'vendor.read',
  VENDOR_UPDATE: 'vendor.update',
  VENDOR_DELETE: 'vendor.delete',

  PRODUCT_CREATE: 'product.create',
  PRODUCT_READ: 'product.read',
  PRODUCT_UPDATE: 'product.update',
  PRODUCT_DELETE: 'product.delete',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_LIST = Object.values(PERMISSIONS);
