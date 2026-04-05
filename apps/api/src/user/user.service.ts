import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DATABASE_MODULE, type TDB } from 'src/database/db.module';
import { type TUserUpdateSchema } from '@repo/contracts/user';
import { and, desc, eq, gte, isNull, or, sql } from 'drizzle-orm';
import { user } from './user.schema';
import { TUserCreateSchema } from '@repo/contracts/user';
import { type Role } from '@repo/contracts/roles';

type TUserInfo = { name: string; email: string; role: Role };
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

  async getAdmin() {
    const [admin] = await this.db
      .select()
      .from(user)
      .where(and(isNull(user.deletedAt), eq(user.role, 'admin')));

    return admin;
  }
}
