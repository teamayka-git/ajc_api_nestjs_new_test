import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';

@Injectable()
export class FilesS3Service {
  constructor() {}

  public async uploadFile(imageBuffer: Buffer, fileName: string) {
    console.log('___x1');
    const s3 = new S3();
    console.log('___x2');
    console.log('___x3   ' + process.env.BUCKET_NAME);
    return await s3
      .upload({
        Bucket: process.env.BUCKET_NAME!,
        Body: imageBuffer,
        Key: fileName,
      })
      .promise();
  }
  public async deleteFile(key: string) {
    const s3 = new S3();
    return await s3
      .deleteObject({
        Bucket: process.env.BUCKET_NAME!,
        Key: key,
      })
      .promise();
  }
}
