import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { TUserCreateSchema, TUserUpdateSchema } from '@repo/contracts/src/user';
import { DATABASE_MODULE, TDB } from 'src/database/db.module';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';

type TPayload = TUserUpdateSchema & { id: number };

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_MODULE) private db: TDB,
    private userService: UserService,
    configService: ConfigService,
  ) {}

  async createJWT(payload: TPayload) {}

  async signup(userDto: TUserCreateSchema) {
    const existingUser = await this.userService.getUserByEmail(userDto.email);

    if (existingUser) throw new ConflictException('Email already exists');
  }
}
