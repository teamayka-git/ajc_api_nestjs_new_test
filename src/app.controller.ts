import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  SetMetadata,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ChangeMyPasswordDto, ChangeUserPasswordDto, ChatDocumentCreateDto, GetDashboardDto, GetUserDto, MeDto, tempWorktable, TestDto } from './app.dto';
import { AppService } from './app.service';
import { Roles } from './Auth/roles.decorator';
import { diskStorage } from 'multer';
import { RolesGuard } from './Auth/roles.guard';
import { FileMulterHelper } from './shared/file_multter_helper';
import { ChatGateway } from './socket/chat.gateway';

@ApiTags('')
@Controller()
@UseGuards(RolesGuard)
export class AppController {
  constructor(
    private readonly appService: AppService,
    private chatGateway: ChatGateway,
  ) {}

  @Post('chatDocumentUpload')
  @ApiCreatedResponse({
    description: 'files upload on these input feilds => [document]',
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'document',
        },
      ],
      /*{
        storage: diskStorage({
          destination: FileMulterHelper.filePathChatDocuments,
          filename: FileMulterHelper.customFileName,
        }),
      },*/
    ),
  )
  create(
    @Body() dto: ChatDocumentCreateDto,
    @Request() req,
    @UploadedFiles() file,
  ) {
    return this.chatGateway.chatFileUpload(
      dto,
      req['_userId_'],
      file == null ? {} : JSON.parse(JSON.stringify(file)),
    );
  }

  @Post('chatGetUsersList')
  chatGetUsersList(@Request() req) {
    return this.chatGateway.chatGetUsersList(req['_userId_']);
  }

  @Post('getUser')
  getUser(@Body() dto: GetUserDto) {
    return this.appService.getUser(dto);
  }
  
  @Post('changeMyPassword')
  changeMyPassword(@Body() dto: ChangeMyPasswordDto,@Request() req) {
    return this.appService.changeMyPassword(dto,req['_userId_']);
  }


  @Post('changeUserPassword')
  changeUserPassword(@Body() dto: ChangeUserPasswordDto) {
    return this.appService.changeUserPassword(dto);
  }


  @Post('test')
  test(@Body() dto: TestDto,) {
    return this.appService.test(dto);
  }
  @Post('tempWorkTableUpdate')
  tempWorkTableUpdate(@Body() dto: tempWorktable,) {
    return this.appService.tempWorkTableUpdate(dto);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Post('me')
  me(@Body() dto: MeDto, @Request() req) {
    return this.appService.me(dto, req['_userId_']);
  }
  @Post('project_init')
  project_init() {
    return this.appService.project_init();
  }
  
  @Post('getDashboard')
  getDashboard(@Body() dto: GetDashboardDto, @Request() req) {
    return this.appService.getDashboard(dto,req['_userId_']);
  }
}
