// src/email/email.service.ts
import * as sgMail from '@sendgrid/mail';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY')!);
  }

  async sendVerificationEmail(email: string, code: string): Promise<void> {
    const msg = {
      to: email,
      from: this.configService.get<string>('SENDGRID_SENDER_EMAIL')!, // Use ConfigService to get sender email
      subject: 'Verify Your Email Address',
      text: `Please use the following verification code to verify your email: ${code}`,
      html: `<p>Thank you for registering! Use the following code to verify your email:</p><h2>${code}</h2>`,
    };

    try {
      await sgMail.send(msg);
      console.log(`Verification email sent to ${email}`);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }
}
