import { Injectable } from '@nestjs/common';
import { TConfig } from './lib/config';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class AppService {
  s3: S3Client;

  constructor(private configService: ConfigService<TConfig>) {
    this.s3 = new S3Client({
      region: this.configService.get('minio_region', { infer: true }),
      endpoint: this.configService.get('minio_endpoint', { infer: true }),
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.configService.get('minio_access_key', {
          infer: true,
        }),
        secretAccessKey: this.configService.get('minio_secret_key', {
          infer: true,
        }),
      },
    });
  }

  async getPresignedUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.configService.get('minio_bucket', { infer: true }),
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(this.s3, command, { expiresIn: 3600 });

    return url;
  }
}
