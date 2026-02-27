import {
  Permission,
  PERMISSION_LIST,
  PERMISSIONS,
} from './permissions.constants';
import { Role, ROLES } from './roles.constants';

type RolePermission = {
  role: Role;
  permissions: Permission[];
};

export const ROLE_PERMISSION_LIST: RolePermission[] = [
  {
    role: ROLES.ADMIN,
    permissions: [...PERMISSION_LIST],
  },
  {
    role: ROLES.FACULTY,
    permissions: [PERMISSIONS.PRODUCT_READ, PERMISSIONS.VENDOR_READ],
  },
  {
    role: ROLES.STUDENT,
    permissions: [PERMISSIONS.PRODUCT_READ],
  },
];
