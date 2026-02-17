import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { DATABASE_MODULE, TDB } from 'src/database/db.module';
import type { TUserCreateSchema } from '@repo/contracts/src/user';
import { user } from 'src/database/schema';
import { and, eq, isNull } from 'drizzle-orm';

@Injectable()
export class UserService {
  constructor(@Inject(DATABASE_MODULE) public db: TDB) {}

  async getUserById(id: string) {
    const res = await this.db
      .select()
      .from(user)
      .where(and(isNull(user.deletedAt), eq(user.id, Number(id))));

    return res[0];
  }

  async getUserByEmail(email: string) {
    const res = await this.db
      .select()
      .from(user)
      .where(and(isNull(user.deletedAt), eq(user.email, email)));

    return res[0];
  }
  async createUser(userDto: TUserCreateSchema) {
    const existingUser = await this.getUserByEmail(userDto.email);

    if (existingUser) throw new ConflictException('Email already exists');

    const [res] = await this.db
      .insert(user)
      .values({
        email: userDto.email,
        name: userDto.email,
      })
      .returning();

    return res;
  }
}
