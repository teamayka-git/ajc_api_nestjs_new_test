import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
const AWS = require('aws-sdk');
import { v4 as uuidv4 } from 'uuid';

export class S3BucketUtils {
  public async uploadMyFile(file: Object, path: String) {
    return new Promise(function (resolve, reject) {
      const s3 = new AWS.S3({
        accessKeyId: process.env.AWSAccessKeyID,
        secretAccessKey: process.env.AWSSecretAccessKey,
      });

      let base64data = Buffer.from(file['buffer'], 'binary');

      const params = {
        Bucket: process.env.CDN_BUCKET_NAME,
        Key: this.getFileNameGeneratedByCdnBucket(file['originalname'], path),
        Body: base64data,
      };
      s3.upload(params, function (err, data) {
        if (err) {
          resolve({ status: 0 });
          // throw err;
        }
        console.log('data   ' + JSON.stringify(data));
        resolve({ status: 1, url: data.Location });
      });
    });
  }

  public async getFileNameGeneratedByCdnBucket(
    fileName: String,
    path: String,
  ): Promise<String> {
    return (
      process.env.CDN_BUCKET_INITIAL_PATH +
      path +
      process.env.CDN_BUCKET_FILE_NAME_PREFIX +
      uuidv4() +
      fileName
    );
  }
}
