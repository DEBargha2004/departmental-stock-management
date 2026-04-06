import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TUserCreateSchema } from '@repo/contracts/user';
import { AuthService } from 'src/authentication/auth.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class UserManagementSevice {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  async createUser(userDto: TUserCreateSchema) {
    const existingUser = await this.userService.getUserByEmail(userDto.email);
    if (existingUser) throw new ConflictException('Email already exists');

    const user = await this.userService.createUser({
      name: userDto.name,
      email: userDto.email,
      role: userDto.role,
    });

    await this.authService.createCredentials(user.id, userDto.password);

    return user;
  }

  async updateUser(userId: number, userDto: TUserCreateSchema) {
    const existingUser = await this.userService.getUserById(userId);
    if (!existingUser) throw new NotFoundException('User not found');

    const userWithMail = await this.userService.getUserByEmail(userDto.email);
    if (userWithMail && userWithMail.id !== userId)
      throw new ConflictException('Email already in use');

    const newUser = await this.userService.updateUser(userId, {
      name: userDto.name,
      email: userDto.email,
      role: userDto.role,
    });
    await this.authService.updateCredentials(userId, userDto.password);

    return newUser;
  }

  async deleteUser(userId: number) {
    const user = await this.userService.deleteUser(userId);
    await this.authService.deleteCredentials(userId);

    return user;
  }

  async getUser(userId: number) {
    const user = await this.userService.getUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    return user;
  }
}
