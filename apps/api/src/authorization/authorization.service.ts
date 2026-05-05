import { Inject, Injectable } from '@nestjs/common';
import { TJWTPayload } from 'src/authentication/auth.service';
import { DATABASE_MODULE, type TDB } from 'src/database/db.module';
import { ROLE_ACCESS_LIST } from './role-access.constants';

@Injectable()
export class AuthorizationService {
  constructor(@Inject(DATABASE_MODULE) private db: TDB) {}

  async getRoleAccessList(user: TJWTPayload) {
    const moduleAccessList = ROLE_ACCESS_LIST.find(
      ({ role }) => role === user.role,
    );

    return moduleAccessList?.modules ?? [];
  }
}
