import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DATABASE_MODULE, TDB } from 'src/database/db.module';
import type {
  TUserCreateSchema,
  TUserUpdateSchema,
} from '@repo/contracts/src/user';
import { user } from 'src/database/schema';
import { and, desc, eq, gte, isNull, or, sql } from 'drizzle-orm';

@Injectable()
export class UserService {
  constructor(@Inject(DATABASE_MODULE) public db: TDB) {}

  async getUserById(id: number) {
    const [res] = await this.db
      .select()
      .from(user)
      .where(and(isNull(user.deletedAt), eq(user.id, id)));

    return res;
  }

  async getUserByEmail(email: string) {
    const res = await this.db
      .select()
      .from(user)
      .where(and(isNull(user.deletedAt), eq(user.email, email)));

    return res[0];
  }
  async createUser(userDto: TUserCreateSchema) {
    const [res] = await this.db
      .insert(user)
      .values({
        email: userDto.email,
        name: userDto.email,
      })
      .returning();

    return res;
  }

  async updateUser(id: number, updateUserDto: TUserUpdateSchema) {
    const [updatedUser] = await this.db
      .update(user)
      .set({
        name: updateUserDto.name,
        email: updateUserDto.email,
      })
      .returning();

    if (updatedUser)
      throw new InternalServerErrorException('User could not be created');

    return updatedUser;
  }

  async deleteUser(id: number) {
    const [deletedUser] = await this.db
      .update(user)
      .set({ deletedAt: new Date() })
      .where(eq(user.id, id))
      .returning();

    return deletedUser;
  }

  async getUsers(query?: string) {
    const res = await this.db
      .select()
      .from(user)
      .where(
        and(
          isNull(user.deletedAt),
          ...(query
            ? [
                or(
                  gte(sql`SIMILARITY(${user.name},${query})`, 0.3),
                  gte(sql`SIMILARITY(${user.name},${query})`, 0.3),
                ),
              ]
            : []),
        ),
      )
      .orderBy(
        query
          ? desc(
              sql`
          GREATEST(
            SIMILARITY(${user.name}, ${query}),
            SIMILARITY(${user.email}, ${query})
          )
        `,
            )
          : desc(user.createdAt),
      );

    return res;
  }
}
