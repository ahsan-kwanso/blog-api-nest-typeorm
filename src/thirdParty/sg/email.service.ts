// src/email/email.service.ts
import * as sgMail from '@sendgrid/mail';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY')!);
  }

  async sendVerificationEmail(email: string, link: string): Promise<void> {
    const msg = {
      to: email,
      from: this.configService.get<string>('SENDGRID_SENDER_EMAIL')!,
      subject: 'Verify Your Email Address',
      text: `Please click the following link to verify your email: ${link}`,
      html: `<p>Thank you for registering! Click the following link to verify your email:</p><a href="${link}">${link}</a>`,
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
