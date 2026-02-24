import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DATABASE_MODULE, type TDB } from 'src/database/db.module';
import { type TVendor } from '@repo/contracts/vendor';
import { vendor } from './vendor.schema';
import { and, desc, eq, gte, isNull, or, sql } from 'drizzle-orm';
import type { TFilter } from '@repo/contracts/filter';

@Injectable()
export class VendorService {
  constructor(@Inject(DATABASE_MODULE) private db: TDB) {}

  async createVendor(payload: TVendor) {
    const [res] = await this.db
      .insert(vendor)
      .values({
        name: payload.name,
        contactPerson: payload.contactPerson,
        phone: payload.phone,
        email: payload.email,
        address: payload.address,
      })
      .returning();

    if (!res) throw new InternalServerErrorException('Failed to create vendor');

    return res;
  }

  async updateVendor(id: number, payload: TVendor) {
    const [res] = await this.db
      .update(vendor)
      .set({
        name: payload.name,
        contactPerson: payload.contactPerson,
        phone: payload.phone,
        email: payload.email,
        address: payload.address,
      })
      .where(and(eq(vendor.id, id), isNull(vendor.deletedAt)))
      .returning();

    if (!res) throw new InternalServerErrorException('Failed to update vendor');

    return res;
  }

  async deleteVendor(id: number) {
    await this.db
      .update(vendor)
      .set({ deletedAt: new Date() })
      .where(and(eq(vendor.id, id), isNull(vendor.deletedAt)));
  }

  async getVendor(id: number) {
    const [res] = await this.db
      .select({
        id: vendor.id,
        name: vendor.name,
        contactPerson: vendor.contactPerson,
        phone: vendor.phone,
        email: vendor.email,
        address: vendor.address,
      })
      .from(vendor)
      .where(and(eq(vendor.id, id), isNull(vendor.deletedAt)));

    if (!res) throw new NotFoundException('Vendor not found');

    return res;
  }

  async getVendors(filter?: TFilter) {
    const limit = filter?.limit ?? 30;
    const offset = filter?.offset ?? 0;
    const query = filter?.query ?? '';

    const res = await this.db
      .select({
        id: vendor.id,
        name: vendor.name,
        contactPerson: vendor.contactPerson,
        phone: vendor.phone,
        email: vendor.email,
        address: vendor.address,
      })
      .from(vendor)
      .where(
        and(
          isNull(vendor.deletedAt),
          ...(query
            ? [
                or(
                  gte(sql`SIMILARITY(${vendor.name}, ${query})`, 0.3),
                  gte(sql`SIMILARITY(${vendor.phone}, ${query})`, 0.3),
                ),
              ]
            : []),
        ),
      )
      .offset(offset)
      .limit(limit)
      .orderBy(
        desc(
          query
            ? sql`GREATEST(
              SIMILARITY(${vendor.name}, ${query}),
              SIMILARITY(${vendor.phone}, ${query})`
            : vendor.createdAt,
        ),
      );

    return res;
  }
}
