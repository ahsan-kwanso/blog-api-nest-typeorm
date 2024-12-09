import {
  Injectable,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
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

  // Inject S3 configuration using the 'S3_CONFIG' token
  constructor(
    @Inject('S3_CONFIG')
    private readonly s3Config: { s3Client: S3Client; bucketName: string },
  ) {
    this.s3Client = this.s3Config.s3Client;
    this.s3BucketName = this.s3Config.bucketName;
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
