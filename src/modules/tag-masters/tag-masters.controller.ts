import { Body, Controller, Delete, Post, Put, Request, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { TagMastersService } from './tag-masters.service';
import { CheckNameExistDto, TagMasterCreateDto, TagMasterEditDto, TagMasterListDto, TagMasterStatusChangeDto } from './tag_masters.dto';


@ApiTags('Tag master Docs')
@Controller('tag-masters')
export class TagMastersController {
  constructor(private readonly tagMastersService: TagMastersService) {}





  @Post()
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
          destination: FileMulterHelper.filePathTempBranch,
          filename: FileMulterHelper.customFileName,
        }),
      },*/
    ),
  )
  create(@Body() dto: TagMasterCreateDto, @Request() req, @UploadedFiles() file) {
    return this.tagMastersService.create(
      dto,
      req['_userId_'],
      file == null ? {} : JSON.parse(JSON.stringify(file)),
    );
  }

  @Put()
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
          destination: FileMulterHelper.filePathTempBranch,
          filename: FileMulterHelper.customFileName,
        }),
      },*/
    ),
  )
  edit(@Body() dto: TagMasterEditDto, @Request() req, @UploadedFiles() file) {
    return this.tagMastersService.edit(
      dto,
      req['_userId_'],
      file == null ? {} : JSON.parse(JSON.stringify(file)),
    );
  }
  @Delete()
  status_change(@Body() dto: TagMasterStatusChangeDto, @Request() req) {
    return this.tagMastersService.status_change(dto, req['_userId_']);
  }

  @Post('list')
  list(@Body() dto: TagMasterListDto) {
    return this.tagMastersService.list(dto);
  }

  @Post('checkNameExisting')
  checkNameExisting(@Body() dto: CheckNameExistDto) {
    return this.tagMastersService.checkNameExisting(dto);
  }




}
