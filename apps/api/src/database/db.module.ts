import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export const DATABASE_MODULE = Symbol('DATABASE_MODULE');
export type TDB = NodePgDatabase;

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_MODULE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db_url = config.get<string>('db_url');

        const pool = new Pool({
          connectionString: db_url,
        });

        return drizzle({ client: pool });
      },
    },
  ],
  exports: [DATABASE_MODULE],
})
export class DatabaseModule {}
