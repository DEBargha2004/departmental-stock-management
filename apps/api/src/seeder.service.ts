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
    // const rolePermissions = ROLE_PERMISSION_LIST;
    // for (const rp of rolePermissions) {
    //   const existingPermissions =
    //     await this.authorizationService.getRolePermissions(rp.role);
    // }
  }

  private async seedAdmin() {
    const [admin] = await this.db
      .select()
      .from(user)
      .leftJoin(userRole, eq(user.id, userRole.userId))
      .leftJoin(role, eq(userRole.roleId, role.id))
      .where(
        and(
          isNull(user.deletedAt),
          eq(userRole.isActive, true),
          eq(role.code, ROLES.ADMIN),
        ),
      )
      .groupBy(user.id);

    if (!admin) {
      const username = this.config.get('admin_name', { infer: true })!;
      const email = this.config.get('admin_email', { infer: true })!;
      const password = this.config.get('admin_password', { infer: true })!;

      const user = await this.userService.createUser({
        name: username,
        email,
      });
      await this.authService.createCredentials(user.id, password);
      // TODO: assign admin role to the user
      console.log('Admin seeded successfully');
    } else {
      console.log('Admin already exists');
    }
  }
}
