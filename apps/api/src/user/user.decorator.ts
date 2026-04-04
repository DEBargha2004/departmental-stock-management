import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TJWTPayload } from 'src/authentication/auth.service';

export const CurrentUser = createParamDecorator(
  (data: keyof TJWTPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const jwt = request.jwt as TJWTPayload;

    return data ? jwt[data] : jwt;
  },
);
