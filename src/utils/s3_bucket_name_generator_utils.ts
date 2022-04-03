import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
const AWS = require('aws-sdk');
import { v4 as uuidv4 } from 'uuid';

export class S3BucketNameGeneratorUtils {
  public async getFileNameGeneratedByCdnBucket(fileName: String, path: String) {
    return (
      process.env.CDN_BUCKET_INITIAL_PATH +
      path +
      process.env.CDN_BUCKET_FILE_NAME_PREFIX +
      uuidv4() +
      fileName
    );
  }
}
