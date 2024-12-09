import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Provider } from '@nestjs/common';

export const S3ClientProvider: Provider = {
  provide: 'S3_CONFIG', // Use a unique token to provide both S3Client and bucket name
  useFactory: async (configService: ConfigService) => {
    const s3Client = new S3Client({
      region: configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY')!,
      },
    });

    const bucketName = configService.get<string>('AWS_S3_BUCKET_NAME')!;

    // Return an object that includes both S3Client and bucket name
    return {
      s3Client,
      bucketName,
    };
  },
  inject: [ConfigService], // Inject ConfigService to access environment variables
};
