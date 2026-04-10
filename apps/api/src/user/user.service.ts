import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DATABASE_MODULE, type TDB } from 'src/database/db.module';
import { type TUserUpdateSchema } from '@repo/contracts/user';
import { and, count, desc, eq, gte, isNull, or, sql } from 'drizzle-orm';
import { user } from './user.schema';
import { TUserCreateSchema } from '@repo/contracts/user';
import { type Role } from '@repo/contracts/roles';
import { TUserInfo } from './user.utils';

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
  async createUser(userDto: TUserInfo) {
    const [res] = await this.db
      .insert(user)
      .values({
        email: userDto.email,
        name: userDto.name,
        role: userDto.role,
      })
      .returning();

    return res;
  }

  async updateUser(id: number, updateUserDto: TUserInfo) {
    const [updatedUser] = await this.db
      .update(user)
      .set({
        name: updateUserDto.name,
        email: updateUserDto.email,
        role: updateUserDto.role,
      })
      .where(and(eq(user.id, id), isNull(user.deletedAt)))
      .returning();

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

  async getUsers({
    query,
    role,
    limit = 20,
    page = 1,
  }: {
    query?: string;
    role?: Role;
    limit: number;
    page: number;
  }) {
    const baseQuery = this.db
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
          ...(role ? [eq(user.role, role)] : []),
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
      )
      .as('base_query');

    const selectQuery = this.db
      .select()
      .from(baseQuery)
      .limit(limit)
      .offset((page - 1) * limit);

    const [users, [totalRes]] = await Promise.all([
      selectQuery,
      this.db.select({ count: count() }).from(baseQuery),
    ]);

    return { users, count: totalRes.count };
  }

  async getAdmin() {
    const [admin] = await this.db
      .select()
      .from(user)
      .where(and(isNull(user.deletedAt), eq(user.role, 'admin')));

    return admin;
  }
}
