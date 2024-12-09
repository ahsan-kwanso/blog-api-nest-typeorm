import { ConfigService } from '@nestjs/config';
import { Provider } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

export const SendGridProvider: Provider = {
  provide: 'SENDGRID_CONFIG',
  useFactory: async (configService: ConfigService) => {
    const apiKey = configService.get<string>('SENDGRID_API_KEY')!;
    const senderEmail = configService.get<string>('SENDGRID_SENDER_EMAIL')!;

    // Set the API key globally for SendGrid
    sgMail.setApiKey(apiKey);

    return {
      apiKey,
      senderEmail,
    };
  },
  inject: [ConfigService], // Inject ConfigService to access environment variables
};
