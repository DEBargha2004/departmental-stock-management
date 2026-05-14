import {
  Permission,
  PERMISSION_LIST,
  PERMISSIONS,
} from '@repo/contracts/permission';
import { type Role, ROLES } from '@repo/contracts/roles';

type RolePermission = {
  role: Role;
  permissions: Permission[];
};

export const ROLE_PERMISSION_LIST = [
  {
    role: ROLES.ADMIN,
    permissions: PERMISSION_LIST,
  },
  {
    role: ROLES.FACULTY,
    permissions: [
      PERMISSIONS.PRODUCT_READ,
      PERMISSIONS.STOCK_READ,
      PERMISSIONS.USER_READ,

      PERMISSIONS.ISSUE_REQUEST_CREATE,
      PERMISSIONS.ISSUE_REQUEST_READ,
      PERMISSIONS.ISSUE_REQUEST_UPDATE,
      PERMISSIONS.ISSUE_REQUEST_DELETE,

      PERMISSIONS.RETURN_REQUEST_CREATE,
      PERMISSIONS.RETURN_REQUEST_READ,
      PERMISSIONS.RETURN_REQUEST_UPDATE,
      PERMISSIONS.RETURN_REQUEST_DELETE,
    ],
  },
  {
    role: ROLES.STUDENT,
    permissions: [PERMISSIONS.PRODUCT_READ, PERMISSIONS.STOCK_READ],
  },
] as const satisfies RolePermission[];
