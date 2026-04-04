import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { Permission } from 'src/authorization/permissions.constants';
import {
  PermissionGuard,
  Permissions,
} from 'src/authorization/permission.guard';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const jwt_secret = this.configService.get('jwt_secret', { infer: true })!;
    const authHeader = request.headers['authorization'] ?? '';

    const [_, token] = authHeader.split(' ');

    const isJwtValid = AuthService.validateJWT(token, jwt_secret);
    if (isJwtValid) {
      request.jwt = isJwtValid;
      return true;
    }

    throw new UnauthorizedException('Invalid token');
  }
}

export const Auth = (...permissions: Permission[]) => {
  return applyDecorators(
    UseGuards(AuthGuard, PermissionGuard),
    Permissions(...permissions),
  );
};
