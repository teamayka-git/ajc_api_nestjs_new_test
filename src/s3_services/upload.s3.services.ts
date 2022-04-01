import { Injectable } from '@nestjs/common';
import { FilesS3Service } from './file.s3.services';

@Injectable()
export class UploadService {
  constructor(private readonly filesService: FilesS3Service) {}

  async addAvatar(imageBuffer: Buffer, fileName: string) {
    return await this.filesService.uploadFile(imageBuffer, fileName);
  }
}
