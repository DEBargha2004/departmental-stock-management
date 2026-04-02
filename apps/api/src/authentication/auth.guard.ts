import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

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
    if (isJwtValid) return true;

    return false;
  }
}
