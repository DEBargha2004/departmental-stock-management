import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TConfig } from './lib/config';
import { UserService } from './user/user.service';
import { ROLE_LIST } from '@repo/contracts/roles';
import { UserManagementService } from './user-management/user-management.service';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    private config: ConfigService<TConfig>,
    private userService: UserService,
    private userManagementService: UserManagementService,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  async createAdmin(username: string, email: string, password: string) {
    const roles = ROLE_LIST;
    const adminRole = roles.find((rl) => rl === 'admin');
    if (!adminRole) throw new Error('Admin Role not found/seeded');

    await this.userManagementService.createUser(
      {
        name: username,
        email,
        password,
        role: 'admin',
      },
      {
        id: null,
        name: 'SYSTEM',
      },
    );
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
