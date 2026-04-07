import { Role } from '@repo/contracts/roles';

export type TUserInfo = { name: string; email: string; role: Role };

export function buildUserObject(user: { id: number } & TUserInfo) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
