import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TConfig } from './lib/config';
import { UserService } from './user/user.service';
import { ROLE_LIST, ROLES } from './authorization/roles.constants';
import { AuthService } from './authentication/auth.service';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    private config: ConfigService<TConfig>,
    private userService: UserService,
    private authService: AuthService,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  async createAdmin(username: string, email: string, password: string) {
    const roles = ROLE_LIST;
    const adminRole = roles.find((rl) => rl === 'admin');
    if (!adminRole) throw new Error('Admin Role not found/seeded');

    const user = await this.userService.createUser({
      name: username,
      email,
      role: 'admin',
    });
    await this.authService.createCredentials(user.id, password);
  }

  private async seedAdmin() {
    const admin = await this.userService.getAdmin();

    if (!admin) {
      const username = this.config.get('admin_name', { infer: true })!;
      const email = this.config.get('admin_email', { infer: true })!;
      const password = this.config.get('admin_password', { infer: true })!;

      await this.createAdmin(username, email, password);
      console.log('Admin seeded successfully');
    } else {
      console.log('Admin already exists');
    }
  }
}
