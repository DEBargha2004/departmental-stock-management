import { Role } from '@repo/contracts/roles';
import { MODULE_LIST, type MODULE } from '@repo/contracts/module';

type RoleAccess = {
  role: Role;
  modules: MODULE[];
};

export const ROLE_ACCESS_LIST = [
  {
    role: 'admin',
    modules: MODULE_LIST,
  },
  {
    role: 'faculty',
    modules: ['products', 'users'],
  },
  {
    role: 'student',
    modules: [],
  },
] as const satisfies RoleAccess[];
