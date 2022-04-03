import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
const AWS = require('aws-sdk');

export class S3BucketUtils {
  public async uploadMyFile(file: Object) {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWSAccessKeyID,
      secretAccessKey: process.env.AWSSecretAccessKey,
    });
    console.log('___e1');

    let base64data = Buffer.from(file['buffer'], 'binary');
    console.log('___e2');
    console.log(
      '___f3    ' + process.env.BUCKET_NAME + '    ' + file['originalname'],
    );
    console.log('___e4');
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: 'fayiz1/' + 'eee' + file['originalname'],
      Body: base64data,
    };
    console.log('___e5');
    s3.upload(params, function (err, data) {
      if (err) {
        console.log('___e7');
        console.log(err);
        throw err;
      }

      console.log('___e8');
      console.log(data);
      console.log(`File uploaded successfully. ${data.Location}`);
    });

    console.log('___e6');
  }
}
