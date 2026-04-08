import { Inject, Injectable } from '@nestjs/common';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { DATABASE_MODULE, type TDB } from './db.module';

@Injectable()
export class MigrationService {
  constructor(@Inject(DATABASE_MODULE) private db: TDB) {}
  async run() {
    await migrate(this.db, {
      migrationsFolder: '../../drizzle',
    });
  }
}
