import { Body, Controller, Get, Post, Request, SetMetadata, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ChatDocumentCreateDto, MeDto } from './app.dto';
import { AppService } from './app.service';
import { Roles } from './Auth/roles.decorator';
import { diskStorage } from 'multer';
import { RolesGuard } from './Auth/roles.guard';
import { FileMulterHelper } from './shared/file_multter_helper';
import { ChatGateway } from './socket/chat.gateway';

@ApiTags("") 
@Controller()
@UseGuards(RolesGuard)
export class AppController {
  constructor(   private readonly appService: AppService,private chatGateway:ChatGateway) {}




  @Post()
  @ApiCreatedResponse({ description: 'files upload on these input feilds => [document]' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'document',
        },
      ],
      {
        storage: diskStorage({
          destination: FileMulterHelper.filePathChatDocuments,
          filename: FileMulterHelper.customFileName,
        }),
      },
    ),
  )
  create(@Body() dto: ChatDocumentCreateDto,@Request() req, @UploadedFiles() file) {
    return this.chatGateway.chatFileUpload(dto,req["_userId_"],file == null ? {} : JSON.parse(JSON.stringify(file)));
  }


  @Post("chatGetUsersList")
  chatGetUsersList(@Request() req) {
    return this.chatGateway.chatGetUsersList(req["_userId_"]);
  }














  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Post("me")
  me(@Body() dto: MeDto, @Request() req) {
    return this.appService.me(dto, req['_userId_']);
  }
  @Post("project_init")
  project_init() {
    return this.appService.project_init();
  }
}
