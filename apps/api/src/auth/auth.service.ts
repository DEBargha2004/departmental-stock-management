import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { TUserUpdateSchema } from '@repo/contracts/user';
import type { TSignIn } from '@repo/contracts/sign-in';
import { DATABASE_MODULE, type TDB } from 'src/database/db.module';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { credentials, resetPasswordToken } from 'src/database/schema';
import { and, eq, gt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { TConfig } from 'src/lib/config';
import jwt from 'jsonwebtoken';
import { MailService } from 'src/mail/mail.service';
import crypto from 'crypto';
import type { TResetPassword } from '@repo/contracts/reset-password';

type TJWTPayload = TUserUpdateSchema & { id: number };

@Injectable()
export class AuthService {
  private saltRounds = 10;
  constructor(
    @Inject(DATABASE_MODULE) private db: TDB,
    private userService: UserService,
    private configService: ConfigService<TConfig>,
    private mailService: MailService,
  ) {}

  private createJWT(payload: TJWTPayload) {
    const jwt_secret = this.configService.get('jwt_secret', { infer: true })!;
    const jwt_expiry = this.configService.get('jwt_expires_in', {
      infer: true,
    })!;

    const token = jwt.sign(payload, jwt_secret, {
      expiresIn: Math.floor(Date.now() / 1000) + jwt_expiry,
    });

    return token;
  }

  validateJWT(token: string) {
    try {
      const jwt_secret = this.configService.get('jwt_secret', { infer: true })!;
      const decoded = jwt.verify(token, jwt_secret) as TJWTPayload;

      return decoded;
    } catch (error) {
      return null;
    }
  }

  private async getCredentials(id: number) {
    const [res] = await this.db
      .select()
      .from(credentials)
      .where(eq(credentials.userId, id));
    return res;
  }

  async hashPassword(raw: string) {
    const encryptedPassword = await bcrypt.hash(raw, this.saltRounds);
    return encryptedPassword;
  }

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async comparePassword(password: string, hash: string) {
    const res = await bcrypt.compare(password, hash);
    return res;
  }

  async signIn(payload: TSignIn) {
    const existingUser = await this.userService.getUserByEmail(payload.email);
    if (!existingUser) throw new UnauthorizedException('Invalid credentials');

    const credentials = await this.getCredentials(existingUser.id);
    if (!credentials) throw new UnauthorizedException('Invalid credentials');

    const isPasswordMatch = await this.comparePassword(
      payload.password,
      credentials.password,
    );
    if (!isPasswordMatch)
      throw new UnauthorizedException('Invalid credentials');

    const jwt = this.createJWT({
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
    });

    return jwt;
  }

  async sendVerificationMail(email: string) {
    const existingUser = await this.userService.getUserByEmail(email);
    if (!existingUser) return;

    const token = crypto.randomBytes(32).toString('hex');
    const hash = this.hashToken(token);
    const expiry = 10 * 60;

    await this.db.transaction(async (trx) => {
      await trx
        .delete(resetPasswordToken)
        .where(eq(resetPasswordToken.userId, existingUser.id));

      await trx.insert(resetPasswordToken).values({
        userId: existingUser.id,
        tokenHash: hash,
        expiredAt: new Date(Date.now() + expiry),
      });
    });

    const frontend_url = this.configService.get('frontend_url', {
      infer: true,
    });
    const resetLink = `${frontend_url}/auth/reset-password?token=${token}`;

    await this.mailService.sendResetPasswordEmail(
      existingUser.email,
      resetLink,
    );
  }

  async resetPassword(payload: TResetPassword) {
    const tokenHash = this.hashToken(payload.code);
    const [resetPasswordEntry] = await this.db
      .select()
      .from(resetPasswordToken)
      .where(
        and(
          eq(resetPasswordToken.tokenHash, tokenHash),
          gt(resetPasswordToken.expiredAt, new Date()),
        ),
      );

    if (!resetPasswordEntry)
      throw new UnauthorizedException('Token invalid or expired');

    const passwordHash = await this.hashPassword(payload.password);

    await this.db
      .update(credentials)
      .set({
        password: passwordHash,
      })
      .where(eq(credentials.userId, resetPasswordToken.userId));

    await this.db
      .delete(resetPasswordToken)
      .where(eq(resetPasswordToken.id, resetPasswordEntry.id));
  }
}
