import { Body, Controller, Delete, Post, Request, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

import { PhotographyRequestService } from './photography-request.service';
import {
  PhotographyRequestCreateDto,
  PhotographyRequestListDto,
  PhotographyRequestStatusChangeDto,
  PhotographyStatusChangeDto,
  ProductDocumentsStatusChangeDto,
} from './photography_request.dto';

@ApiTags('Photography Requests Docs')
@Controller('photography-request')
export class PhotographyRequestController {
  constructor(
    private readonly photographyRequestService: PhotographyRequestService,
  ) {}
  @Post()
  create(@Body() dto: PhotographyRequestCreateDto, @Request() req) {
    return this.photographyRequestService.create(dto, req['_userId_']);
  }
  @Post('request_status_change')
  @ApiCreatedResponse({
    description: 'files upload on these input feilds => [documents]',
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'documents',
        },
      ],
      /*{
        storage: diskStorage({
          destination: FileMulterHelper.filePathTempStone,
          filename: FileMulterHelper.customFileName,
        }),
      },*/
    ),
  )
  request_status_change(
    @Body() dto: PhotographyRequestStatusChangeDto,
     @Request() req, @UploadedFiles() file
  ) {
    return this.photographyRequestService.request_status_change(
      dto,
      req['_userId_'],
      file == null ? {} : JSON.parse(JSON.stringify(file)),
    );
  }
  @Delete()
  status_change(@Body() dto: PhotographyStatusChangeDto, @Request() req) {
    return this.photographyRequestService.status_change(dto, req['_userId_']);
  }
  @Delete("status_change_product_documents")
  status_change_product_documents(@Body() dto: ProductDocumentsStatusChangeDto, @Request() req) {
    return this.photographyRequestService.status_change_product_documents(dto, req['_userId_']);
  }

  @Post('list')
  list(@Body() dto: PhotographyRequestListDto) {
    return this.photographyRequestService.list(dto);
  }
}
