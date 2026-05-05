import {
  Permission,
  PERMISSION_LIST,
  PERMISSIONS,
} from './permissions.constants';
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
    ],
  },
  {
    role: ROLES.STUDENT,
    permissions: [PERMISSIONS.PRODUCT_READ, PERMISSIONS.STOCK_READ],
  },
] as const satisfies RolePermission[];
