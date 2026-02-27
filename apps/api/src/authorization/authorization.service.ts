import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_MODULE, type TDB } from 'src/database/db.module';
import { Permission } from './permissions.constants';
import { permission, role, rolePermission } from './authorization.schema';
import { Role } from './roles.constants';
import { eq } from 'drizzle-orm';

@Injectable()
export class AuthorizationService {
  constructor(@Inject(DATABASE_MODULE) private db: TDB) {}

  async getPermissions() {
    return await this.db.select().from(permission);
  }

  async createPermissions(list: Permission[]) {
    if (list.length === 0) return;

    await this.db
      .insert(permission)
      .values(list.map((name) => ({ code: name })));
  }

  async getRoles() {
    return await this.db.select().from(role);
  }

  async createRole(list: Role[]) {
    if (list.length === 0) return;

    await this.db.insert(role).values(list.map((name) => ({ code: name })));
  }

  async getRolePermissions(_role: Role) {
    return await this.db
      .select({
        code: permission.code,
      })
      .from(role)
      .leftJoin(rolePermission, eq(role.id, rolePermission.roleId))
      .leftJoin(permission, eq(rolePermission.permissionId, permission.id))
      .where(eq(role.code, _role));
  }
}
