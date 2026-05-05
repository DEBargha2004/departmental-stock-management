import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DATABASE_MODULE,
  type TDB,
  type Transaction,
} from 'src/database/db.module';
import { TUserCreateSchema, TUserUpdateSchema } from '@repo/contracts/user';
import {
  AuthService,
  TJWTPayload,
  TSystemAuthPayload,
} from 'src/authentication/auth.service';
import { UserService } from 'src/user/user.service';
import { AuditService } from 'src/audit/audit.service';

@Injectable()
export class UserManagementService {
  constructor(
    @Inject(DATABASE_MODULE) private db: TDB,
    private userService: UserService,
    private authService: AuthService,
    private auditService: AuditService,
  ) {}

  async createUser(
    userDto: TUserCreateSchema,
    currentUser: TJWTPayload | TSystemAuthPayload,
    trx?: Transaction,
  ) {
    const db = trx ?? this.db;
    return await db.transaction(async (tx) => {
      const existingUser = await this.userService.getUserByEmail(
        userDto.email,
        tx,
      );
      if (existingUser) throw new ConflictException('Email already exists');

      const user = await this.userService.createUser(
        {
          name: userDto.name,
          email: userDto.email,
          role: userDto.role,
        },
        tx,
      );

      await this.authService.createCredentials(user.id, userDto.password, tx);

      await this.auditService.logAction(
        {
          action: 'create',
          actorType: 'user',
          entityId: user.id,
          entityType: 'user',
          description: `Created user with id ${user.id}`,
          userId: currentUser.id,
        },
        tx,
      );

      return user;
    });
  }

  async updateUser(
    userId: number,
    userDto: TUserUpdateSchema,
    currentUser: TJWTPayload,
    trx?: Transaction,
  ) {
    const db = trx ?? this.db;
    return await db.transaction(async (tx) => {
      const existingUser = await this.userService.getUserById(userId, tx);
      if (!existingUser) throw new NotFoundException('User not found');

      const userWithMail = await this.userService.getUserByEmail(
        userDto.email,
        tx,
      );
      if (userWithMail && userWithMail.id !== userId)
        throw new ConflictException('Email already in use');

      const newUser = await this.userService.updateUser(
        userId,
        {
          name: userDto.name,
          email: userDto.email,
          role: userDto.role,
        },
        tx,
      );

      await this.auditService.logAction(
        {
          action: 'update',
          actorType: 'user',
          entityId: userId,
          entityType: 'user',
          description: `Updated user with id ${userId}`,
          userId: currentUser.id,
        },
        tx,
      );

      return newUser;
    });
  }

  async deleteUser(
    userId: number,
    currentUser: TJWTPayload,
    trx?: Transaction,
  ) {
    const db = trx ?? this.db;
    return await db.transaction(async (tx) => {
      const user = await this.userService.deleteUser(userId, tx);
      await this.authService.deleteCredentials(userId, tx);

      await this.auditService.logAction(
        {
          action: 'delete',
          actorType: 'user',
          entityId: userId,
          entityType: 'user',
          description: `Deleted user with id ${userId}`,
          userId: currentUser.id,
        },
        tx,
      );

      return user;
    });
  }

  async getUser(userId: number, trx?: Transaction) {
    const user = await this.userService.getUserById(userId, trx);
    if (!user) throw new NotFoundException('User not found');

    return user;
  }
}
