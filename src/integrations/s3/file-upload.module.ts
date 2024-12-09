import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { ConfigModule } from '@nestjs/config'; // To load AWS credentials from .env
import { S3ClientProvider } from './s3.provider';

@Module({
  imports: [ConfigModule], // Import ConfigModule for accessing environment variables
  providers: [FileUploadService, S3ClientProvider],
  exports: [FileUploadService], // Export service so it can be used in other modules
})
export class FileUploadModule {}
