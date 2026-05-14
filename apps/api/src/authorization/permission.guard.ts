import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Permission } from '@repo/contracts/permission';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { TJWTPayload } from 'src/authentication/auth.service';
import { ROLE_PERMISSION_LIST } from './role-permission.constants';

const PERMISSION_KEY = 'permissions';
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSION_KEY, permissions);

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    let requiredPermissions = this.reflector.getAll<Permission[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    requiredPermissions = requiredPermissions
      .flat()
      .filter((p) => p !== undefined);

    if (!requiredPermissions) return true;

    const request = context.switchToHttp().getRequest();
    const jwt = request.jwt as TJWTPayload;

    const role = jwt.role;
    const rolePermissions = ROLE_PERMISSION_LIST.find((rp) => rp.role === role);

    if (!rolePermissions) return false;

    for (const p of requiredPermissions) {
      //@ts-ignore
      if (!rolePermissions.permissions.includes(p)) {
        return false;
      }
    }
    return true;
  }
}
