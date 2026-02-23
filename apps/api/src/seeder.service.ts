import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { DATABASE_MODULE, type TDB } from './database/db.module';
import { role, user, userRole } from './database/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { ConfigService } from '@nestjs/config';
import { TConfig } from './lib/config';
import { UserService } from './user/user.service';
import { AuthService } from './authentication/auth.service';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    @Inject(DATABASE_MODULE) private db: TDB,
    private config: ConfigService<TConfig>,
    private userService: UserService,
    private authService: AuthService,
  ) {}

  async onModuleInit() {}

  private async seedAdmin() {
    const [admin] = await this.db
      .select()
      .from(user)
      .leftJoin(userRole, eq(user.id, userRole.userId))
      .leftJoin(role, eq(userRole.roleId, role.id))
      .where(
        and(
          isNull(user.deletedAt),
          isNull(userRole.deletedAt),
          eq(role.code, 'ADMIN'),
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
