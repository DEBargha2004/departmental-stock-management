import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_MODULE, type TDB } from 'src/database/db.module';

@Injectable()
export class AuthorizationService {
  constructor(@Inject(DATABASE_MODULE) private db: TDB) {}
}
