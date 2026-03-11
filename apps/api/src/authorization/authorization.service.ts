import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_MODULE, type TDB } from 'src/database/db.module';
import { Permission } from './permissions.constants';
import {
  permission,
  role,
  rolePermission,
  userRole,
} from './authorization.schema';
import { Role } from './roles.constants';
import { and, eq, inArray, isNull, or, sql } from 'drizzle-orm';
import { ROLE_PERMISSION_LIST } from './role-permission.constants';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/authentication/auth.service';
import { user } from 'src/user/user.schema';

type NormalizedRolePermission = {
  role: { id: number; code: Role };
  permission: { id: number; code: Permission };
};
@Injectable()
export class AuthorizationService {
  constructor(
    @Inject(DATABASE_MODULE) private db: TDB,
    private userService: UserService,
    private authService: AuthService,
  ) {}

  async getPermissions() {
    return await this.db
      .select({
        id: permission.id,
        code: permission.code,
      })
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

  async withdrawPermissions(rolePermissionIds: number[]) {
    await this.db
      .delete(rolePermission)
      .where(inArray(rolePermission, rolePermissionIds));
  }

  async getRolePermissionList() {
    return await this.db
      .select({
        role: { id: role.id, code: role.code },
        permission: { id: permission.id, code: permission.code },
      })
      .from(role)
      .leftJoin(rolePermission, eq(role.id, rolePermission.roleId))
      .leftJoin(permission, eq(permission.id, rolePermission.permissionId))
      .where(and(eq(role.isActive, true), eq(permission.isActive, true)));
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

  async createRolePermission(list: { roleId: number; permissionId: number }[]) {
    if (list.length === 0) return;

    await this.db.insert(rolePermission).values(
      list.map((rp) => ({
        permissionId: rp.permissionId,
        roleId: rp.roleId,
      })),
    );
  }

  async deleteRolePermission(list: { roleId: number; permissionId: number }[]) {
    if (list.length === 0) return;

    await this.db
      .delete(rolePermission)
      .where(
        or(
          ...list.map((rp) =>
            and(
              eq(rolePermission.roleId, rp.roleId),
              eq(rolePermission.permissionId, rp.permissionId),
            ),
          ),
        ),
      );
  }

  async getNormalizeRolePermissions() {
    const roles = await this.getRoles();
    const permissions = await this.getPermissions();
    const rp_list: NormalizedRolePermission[] = [];

    for (const rp of ROLE_PERMISSION_LIST) {
      const role = roles.find((r) => r.code === rp.role);
      if (!role) continue;

      for (const p of rp.permissions) {
        const permission = permissions.find((per) => per.code === p);
        if (!permission) continue;

        rp_list.push({
          role: { id: role.id, code: role.code },
          permission: { id: permission.id, code: permission.code },
        });
      }
    }

    return rp_list;
  }

  async createUserRole(userId: number, roleId: number) {
    await this.db.insert(userRole).values({
      userId,
      roleId,
    });
  }

  async getUserRoles(userId: number) {
    const userRoles = await this.db
      .select()
      .from(userRole)
      .where(and(eq(userRole.userId, userId), eq(userRole.isActive, true)));

    return userRoles;
  }

  async deleteUserRole(userId: number, roleId: number) {
    await this.db
      .update(userRole)
      .set({ isActive: false })
      .where(and(eq(userRole.userId, userId), eq(userRole.roleId, roleId)));
  }

  async getAdmin() {
    const [admin] = await this.db
      .select()
      .from(user)
      .leftJoin(userRole, eq(user.id, userRole.userId))
      .leftJoin(role, eq(userRole.roleId, role.id))
      .where(
        and(
          isNull(user.deletedAt),
          eq(userRole.isActive, true),
          eq(role.isActive, true),
          eq(role.code, 'admin'),
        ),
      );

    return admin;
  }

  async createAdmin(username: string, email: string, password: string) {
    const roles = await this.getRoles();
    const adminRole = roles.find((rl) => rl.code === 'admin');
    if (!adminRole) throw new Error('Admin Role not found/seeded');

    const user = await this.userService.createUser({ name: username, email });
    await this.authService.createCredentials(user.id, password);
    await this.createUserRole(user.id, adminRole.id);
  }
}
