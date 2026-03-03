import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_MODULE, type TDB } from 'src/database/db.module';
import { Permission } from './permissions.constants';
import { permission, role, rolePermission } from './authorization.schema';
import { Role } from './roles.constants';
import { and, eq, inArray, isNull } from 'drizzle-orm';

@Injectable()
export class AuthorizationService {
  constructor(@Inject(DATABASE_MODULE) private db: TDB) {}

  async getPermissions() {
    return await this.db
      .select()
      .from(permission)
      .where(eq(permission.isActive, true));
  }

  async createPermissions(list: Permission[]) {
    if (list.length === 0) return;

    await this.db
      .insert(permission)
      .values(list.map((name) => ({ code: name })));
  }

  async deletePermission(list: Permission[]) {
    if (list.length === 0) return;

    await this.db
      .update(permission)
      .set({ isActive: false })
      .where(inArray(permission.code, list));
  }

  async getRoles() {
    return await this.db.select().from(role).where(eq(role.isActive, true));
  }

  async createRole(list: Role[]) {
    if (list.length === 0) return;

    await this.db.insert(role).values(list.map((name) => ({ code: name })));
  }

  async deleteRole(list: Role[]) {
    if (list.length === 0) return;

    await this.db
      .update(role)
      .set({ isActive: false })
      .where(inArray(role.code, list));
  }

  async getRolePermissions(_role: Role) {
    return await this.db
      .select({
        code: permission.code,
      })
      .from(role)
      .leftJoin(rolePermission, eq(role.id, rolePermission.roleId))
      .leftJoin(permission, eq(rolePermission.permissionId, permission.id))
      .where(
        and(
          eq(role.code, _role),
          eq(role.isActive, true),
          eq(permission.isActive, true),
        ),
      );
  }
}
