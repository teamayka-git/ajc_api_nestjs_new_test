import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
const AWS = require('aws-sdk');

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

  public async uploadMyFile(file: Object) {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWSAccessKeyID,
      secretAccessKey: process.env.AWSSecretAccessKey,
    });
    console.log('___f1');

    let base64data = Buffer.from(file['buffer'], 'binary');
    console.log('___f2');
    console.log(
      '___f3    ' + process.env.BUCKET_NAME + '    ' + file['originalname'],
    );
    console.log('___f4');
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: 'fayiz1/' + file['originalname'],
      Body: base64data,
    };
    console.log('___f5');
    s3.upload(params, function (err, data) {
      if (err) {
        console.log('___f7');
        console.log(err);
        throw err;
      }

      console.log('___f8');
      console.log(data);
      console.log(`File uploaded successfully. ${data.Location}`);
    });

    console.log('___f6');
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
