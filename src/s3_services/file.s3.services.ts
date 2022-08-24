import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
const AWS = require('aws-sdk');

@Injectable()
export class FilesS3Service {
  constructor() {}

  public async uploadFile(imageBuffer: Buffer, fileName: string) {
  
    const s3 = new S3();
    return await s3
      .upload({
        Bucket: process.env.CDN_BUCKET_NAME!,
        Body: imageBuffer,
        Key: fileName,
      })
      .promise();
  }

  public async uploadMyFile(file: Object) {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWSAccessKeyID,
      secretAccessKey: process.env.AWSSecretAccessKey,
    });

    let base64data = Buffer.from(file['buffer'], 'binary');
      const params = {
      Bucket: process.env.CDN_BUCKET_NAME,
      Key: 'fayiz1/' + 'qqq' + file['originalname'],
      Body: base64data,
    };
    s3.upload(params, function (err, data) {
      if (err) {
           throw err;
      }

         });

  }

  public async deleteFile(key: string) {
    const s3 = new S3();
    return await s3
      .deleteObject({
        Bucket: process.env.CDN_BUCKET_NAME!,
        Key: key,
      })
      .promise();
  }
}
