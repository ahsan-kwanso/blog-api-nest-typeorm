import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  private s3Client: S3Client;
  private s3BucketName: string;

  constructor(private readonly configService: ConfigService) {
    // Initialize S3 client with credentials and region
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        )!,
      },
    });

    // Fetch bucket name from environment
    this.s3BucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME')!;
  }

  // Method to upload file to S3
  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileName = `${uuidv4()}-${file.originalname}`;
    const fileKey = `profile-pictures/${fileName}`;
    try {
      // Upload file to S3
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.s3BucketName,
          Key: fileKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      // Return file key for further use
      return fileKey;
    } catch (error) {
      throw new InternalServerErrorException('Error uploading file to S3');
    }
  }

  async uploadFileGql(file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
  }): Promise<string> {
    const fileName = `${uuidv4()}-${file.originalname}`;
    const fileKey = `profile-pictures/${fileName}`;
    try {
      // Upload file to S3
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.s3BucketName,
          Key: fileKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      // Return file key for further use
      return fileKey;
    } catch (error) {
      throw new InternalServerErrorException('Error uploading file to S3');
    }
  }

  async getSignedUrlS(fileKey: string): Promise<string> {
    try {
      // Generate signed URL with expiration time
      const signedUrl = await getSignedUrl(
        this.s3Client,
        new GetObjectCommand({
          Bucket: this.s3BucketName,
          Key: fileKey,
        }),
        { expiresIn: 360000 },
      );
      return signedUrl;
    } catch (error) {
      throw new InternalServerErrorException('Error generating signed URL');
    }
  }
}
