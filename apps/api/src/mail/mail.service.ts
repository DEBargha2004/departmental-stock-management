import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor() {}

  async sendResetPasswordEmail(email: string, link: string) {
    console.log(link);
    await Promise.resolve();
  }
}
