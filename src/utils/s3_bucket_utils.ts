import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
const AWS = require('aws-sdk');
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

export class S3BucketUtils {
  public async uploadMyFile(file: Object, path: String) {
    return new Promise(function (resolve, reject) {
      const s3 = new AWS.S3({
        accessKeyId: process.env.AWSAccessKeyID,
        secretAccessKey: process.env.AWSSecretAccessKey,
      });

      let base64data = Buffer.from(file['buffer'], 'binary'); //it was on body that time file was started dowmloading

      //const fileContent = fs.readFileSync(file);

     
      // let bodyFs = fs.createReadStream(file.path) ;
      const svgBuffer = Buffer.from(file['buffer'], 'utf-8');
      const params = {
        // ACL: 'public-read',
        Bucket: process.env.CDN_BUCKET_NAME,
        Key: new S3BucketUtils().getFileNameGeneratedByCdnBucket(
          file['originalname'],
          path,
        ),
        ContentType: file['mimetype'],
        // acl: 'public-read',
        Body: base64data,
      };
      s3.upload(params, function (err, data) {
        if (err) {
          resolve({ status: 0 });
          // throw err;
        }
        resolve({ status: 1, url: data.Location });
      });
    });
  }
  public getFileNameGeneratedByCdnBucket(
    fileName: String,
    path: String,
  ): String {
    return (
      process.env.CDN_BUCKET_INITIAL_PATH +
      path +
      process.env.CDN_BUCKET_FILE_NAME_PREFIX +
      uuidv4() +
      fileName
    );
  }
}
