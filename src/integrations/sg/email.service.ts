import * as sgMail from '@sendgrid/mail';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class EmailService {
  private senderEmail: string;

  // Inject the SendGrid configuration
  constructor(
    @Inject('SENDGRID_CONFIG')
    private readonly sendGridConfig: { senderEmail: string },
  ) {
    this.senderEmail = this.sendGridConfig.senderEmail;
  }

  // Send verification email
  async sendVerificationEmail(email: string, link: string): Promise<void> {
    const msg = {
      to: email,
      from: this.senderEmail, // Use the injected sender email
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

  async sendEmail(
    email: string,
    subject: string,
    message: string,
  ): Promise<void> {
    const msg = {
      to: email,
      from: this.senderEmail, // Use the injected sender email
      subject: `${subject}`,
      text: `${message}`,
    };
    try {
      await sgMail.send(msg);
      console.log(`Completion email sent to ${email}`);
    } catch (error) {
      console.error('Error sending completion email:', error);
      throw new Error('Failed to send completion email');
    }
  }
}
