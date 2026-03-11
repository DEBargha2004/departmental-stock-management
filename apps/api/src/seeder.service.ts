import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { DATABASE_MODULE, type TDB } from './database/db.module';
import { role, userRole } from './database/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { ConfigService } from '@nestjs/config';
import { TConfig } from './lib/config';
import { UserService } from './user/user.service';
import { AuthService } from './authentication/auth.service';
import { user } from './user/user.schema';
import { AuthorizationService } from './authorization/authorization.service';
import { PERMISSION_LIST } from './authorization/permissions.constants';
import { ROLE_LIST, ROLES } from './authorization/roles.constants';
import { ROLE_PERMISSION_LIST } from './authorization/role-permission.constants';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    @Inject(DATABASE_MODULE) private db: TDB,
    private config: ConfigService<TConfig>,
    private userService: UserService,
    private authService: AuthService,
    private authorizationService: AuthorizationService,
  ) {}

  async onModuleInit() {
    await this.seedPermissions();
    await this.seedRoles();
    await this.seedRolePermissions();
  }

  private async seedPermissions() {
    const configPermissions = PERMISSION_LIST;

    const savedPermissions = await this.authorizationService.getPermissions();

    const newPermissions = configPermissions.filter(
      (p) => !savedPermissions.some((ep) => ep.code === p),
    );
    const existingPermissions = savedPermissions
      .filter((p) => !configPermissions.some((cp) => cp === p.code))
      .map((p) => p.code);

    await this.authorizationService.createPermissions(newPermissions);
    await this.authorizationService.deletePermission(existingPermissions);
  }

  private async seedRoles() {
    const configRoles = ROLE_LIST;

    const savedRoles = await this.authorizationService.getRoles();

    const newRoles = configRoles.filter(
      (r) => !savedRoles.some((er) => er.code === r),
    );
    const existingRoles = savedRoles
      .filter((r) => !configRoles.some((cr) => cr === r.code))
      .map((r) => r.code);

    await this.authorizationService.createRole(newRoles);
    await this.authorizationService.deleteRole(existingRoles);
  }

  private async seedRolePermissions() {
    const configRolePermissions =
      await this.authorizationService.getNormalizeRolePermissions();

    const savedRolePermissions =
      await this.authorizationService.getRolePermissionList();

    const newRolePermissions = configRolePermissions.filter(
      (crp) =>
        !savedRolePermissions.some(
          (srp) =>
            srp.role.id === crp.role.id &&
            srp.permission.id === crp.permission.id,
        ),
    );

    const existingRolePermissions = savedRolePermissions.filter(
      (srp) =>
        !configRolePermissions.some(
          (crp) =>
            crp.role.id === srp.role.id &&
            crp.permission.id === srp.permission.id,
        ),
    );

    await this.authorizationService.deleteRolePermission(
      newRolePermissions.map((rp) => ({
        roleId: rp.role.id,
        permissionId: rp.permission.id,
      })),
    );

    await this.authorizationService.deleteRolePermission(
      existingRolePermissions.map((rp) => ({
        roleId: rp.role.id,
        permissionId: rp.permission.id,
      })),
    );
  }

  private async seedAdmin() {
    const admin = await this.authorizationService.getAdmin();

    if (!admin) {
      const username = this.config.get('admin_name', { infer: true })!;
      const email = this.config.get('admin_email', { infer: true })!;
      const password = this.config.get('admin_password', { infer: true })!;

      await this.authorizationService.createAdmin(username, email, password);
      console.log('Admin seeded successfully');
    } else {
      console.log('Admin already exists');
    }
  }
}
