import { Body, Controller, Post } from '@nestjs/common';
import { signInSchema, type TSignIn } from '@repo/contracts/sign-in';
import {
  forgetPasswordSchema,
  type TForgetPassword,
} from '@repo/contracts/forget-password';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import {
  resetPasswordSchema,
  type TResetPassword,
} from '@repo/contracts/reset-password';
import { AuthService } from './auth.service';
import { ResponseBuilder } from 'src/lib/response';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-in')
  async signIn(
    @Body(new ZodValidationPipe(signInSchema))
    body: TSignIn,
  ) {
    const jwt = await this.authService.signIn(body);
    return ResponseBuilder.success(jwt, 'Login Successfull');
  }

  @Post('forget-password')
  @Throttle({ default: { limit: 3, ttl: 60 * 10 } })
  async forgetPassword(
    @Body(new ZodValidationPipe(forgetPasswordSchema)) body: TForgetPassword,
  ) {
    await this.authService.sendVerificationMail(body.email);

    return ResponseBuilder.success(
      null,
      'If the email exists, a reset link has been sent.',
    );
  }

  @Post('reset-password')
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) body: TResetPassword,
  ) {
    await this.authService.resetPassword(body);

    return ResponseBuilder.success(null, 'Password Updated successfully');
  }
}
