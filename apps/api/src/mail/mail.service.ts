import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { TConfig } from 'src/lib/config';

@Injectable()
export class MailService {
  resend: Resend;
  constructor(private readonly configService: ConfigService<TConfig>) {
    this.resend = new Resend(this.configService.get<string>('resend_api_key'));
  }

  private generateResetPasswordTemplate(link: string) {
    const currentYear = new Date().getFullYear();
    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>Reset your Stockify password</title>
  <style type="text/css" rel="stylesheet" media="all">
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    body {
      width: 100% !important;
      height: 100% !important;
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: none;
      background-color: #f8fafc;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    .email-wrapper {
      width: 100%;
      margin: 0;
      padding: 40px 0;
      background-color: #f8fafc;
    }

    .email-content {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }

    .email-header {
      padding: 32px 40px;
      text-align: left;
      border-bottom: 1px solid #f1f5f9;
    }

    .email-body {
      padding: 40px;
    }

    .email-footer {
      padding: 32px 40px;
      background-color: #f8fafc;
      border-top: 1px solid #f1f5f9;
      text-align: left;
    }

    .logo-container {
      display: inline-flex;
      align-items: center;
      gap: 12px;
    }

    .logo-box {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.5px;
    }

    h1 {
      margin-top: 0;
      color: #0f172a;
      font-size: 24px;
      font-weight: 700;
      line-height: 1.3;
      letter-spacing: -0.5px;
    }

    p {
      margin-top: 0;
      color: #475569;
      font-size: 16px;
      line-height: 1.6;
    }

    .button {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      color: #ffffff !important;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);
    }

    .footer-text {
      color: #64748b;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .trouble-section {
      margin-top: 32px;
      padding-top: 32px;
      border-top: 1px solid #f1f5f9;
    }

    .trouble-text {
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
    }

    .link {
      color: #6366f1;
      text-decoration: underline;
    }

    @media only screen and (max-width: 600px) {
      .email-content {
        border-radius: 0;
        border-left: none;
        border-right: none;
      }
      .email-header, .email-body, .email-footer {
        padding: 32px 24px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-content">
      <div class="email-header">
        <div class="logo-container">
          <span class="logo-text">Stockify</span>
        </div>
      </div>

      <div class="email-body">
        <h1>Reset your password</h1>
        <p>Hello,</p>
        <p>We received a request to reset your Stockify password. No changes have been made to your account yet.</p>
        <p>You can reset your password by clicking the button below:</p>
        
        <div style="margin: 32px 0;">
          <a href="${link}" class="button">Reset Password</a>
        </div>

        <p style="font-size: 14px; color: #64748b;">This link will expire in 10 minutes for security reasons. If you did not request a password reset, you can safely ignore this email.</p>

        <div class="trouble-section">
          <p class="trouble-text">
            If you're having trouble clicking the password reset button, copy and paste the URL below into your web browser:
          </p>
          <a href="${link}" class="link" style="font-size: 12px; word-break: break-all;">${link}</a>
        </div>
      </div>

      <div class="email-footer">
        <p class="footer-text">
          Best regards,<br />
          <strong>The Stockify Team</strong>
        </p>
        <p class="footer-text" style="margin-top: 24px; font-size: 12px; color: #94a3b8;">
          &copy; ${currentYear} Stockify. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;
  }

  async sendResetPasswordEmail(email: string, link: string) {
    const template = this.generateResetPasswordTemplate(link);
    await this.resend.emails.send({
      to: email,
      html: template,
      subject: 'Reset Password',
      from: 'Acme <onboarding@resend.dev>',
    });
  }
}
