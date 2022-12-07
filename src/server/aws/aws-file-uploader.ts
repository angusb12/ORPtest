import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { AwsConfig } from '../config';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FileUpload } from './types/FileUpload';
import { v4 as uuidv4 } from 'uuid';
import { UploadedFile } from './types/UploadedFile';

@Injectable()
export class AwsFileUploader {
  private awsConfig: AwsConfig;
  private client: S3;

  constructor(private config: ConfigService) {
    this.awsConfig = config.get<AwsConfig>('aws');
    this.client = new S3({
      region: 'eu-west-2',
      credentials: {
        secretAccessKey: this.awsConfig.secretAccessKey,
        accessKeyId: this.awsConfig.accessKeyId,
      },
    });
  }

  async upload({
    mimetype,
    buffer,
    originalname,
  }: FileUpload): Promise<UploadedFile> {
    try {
      const uuid = uuidv4();
      const fileKey = `${uuid}-${originalname}`;
      await this.client
        .putObject({
          Bucket: this.awsConfig.ingestionBucket,
          Key: fileKey,
          ContentType: mimetype,
          Body: buffer,
          Metadata: {
            uuid,
            uploadedDate: new Date().toTimeString(),
          },
          ACL: 'authenticated-read',
        })
        .promise();

      return { path: `${this.awsConfig.ingestionBucket}/${fileKey}` };
    } catch (e) {
      throw new InternalServerErrorException(
        'There was a problem uploading the document',
      );
    }
  }
}
