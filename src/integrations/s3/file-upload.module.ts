import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { ConfigModule } from '@nestjs/config'; // To load AWS credentials from .env

@Module({
  imports: [ConfigModule], // Import ConfigModule for accessing environment variables
  providers: [FileUploadService],
  exports: [FileUploadService], // Export service so it can be used in other modules
})
export class FileUploadModule {}
