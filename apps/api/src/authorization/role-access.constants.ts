import { Role } from '@repo/contracts/roles';
import { MODULE_LIST, type MODULE } from '@repo/contracts/module';

type RoleAccess = {
  role: Role;
  modules: MODULE[];
};

const notImplemented: MODULE[] = ['dashboard'];

const adminModuleList = MODULE_LIST.filter(
  (it) => !notImplemented.includes(it),
);
const facultyModuleList: MODULE[] = [
  'products',
  'users',
  'issue_requests',
  'return_requests',
];
const studentModuleList: MODULE[] = ['products'];

export const ROLE_ACCESS_LIST = [
  {
    role: 'admin',
    modules: adminModuleList,
  },
  {
    role: 'faculty',
    modules: facultyModuleList,
  },
  {
    role: 'student',
    modules: studentModuleList,
  },
] as const satisfies RoleAccess[];
