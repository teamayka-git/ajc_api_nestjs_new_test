import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
const AWS = require('aws-sdk');
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

export class S3BucketUtils {
  public async uploadMyFile(file, path: String) {
    return new Promise(function (resolve, reject) {
      const s3 = new AWS.S3({
        accessKeyId: process.env.AWSAccessKeyID,
        secretAccessKey: process.env.AWSSecretAccessKey,
      });

      let base64data = Buffer.from(file['buffer'], 'binary'); //it was on body that time file was started dowmloading

      console.log('mimetype   ' + file['mimetype']);
      console.log('path    ' + file['path']);

      // console.log('file    ' + JSON.stringify(file));
      console.log('-----'); //

      // let bodyFs = fs.createReadStream(file.path) ;

      const params = {
        // ACL: 'public-read',
        Bucket: process.env.CDN_BUCKET_NAME,
        Key: new S3BucketUtils().getFileNameGeneratedByCdnBucket(
          file['originalname'],
          path,
          false,
        ),
        contentType: file['mimetype'],
        Body: base64data,
        ContentEncoding: 'base64',
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
  public getFileNameGeneratedByCdnBucket(
    fileName: String,
    path: String,
    isNeedToAddPrefixUrlOfBucket: Boolean,
  ): String {
    var returnString = '';
    if (isNeedToAddPrefixUrlOfBucket == true) {
      returnString += process.env.CDN_BUCKET_PREFIX_URL;
    }

    return (returnString +=
      process.env.CDN_BUCKET_INITIAL_PATH +
      path +
      process.env.CDN_BUCKET_FILE_NAME_PREFIX +
      uuidv4() +
      fileName);
  }
}
