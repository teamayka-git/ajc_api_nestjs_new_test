
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Request,
  Put,
} from '@nestjs/common';
import { UserCheckEmailExistDto, UserCheckMobileExistDto, UserFcmUpdateDto, UserNotificationCreatetDto, UserNotificationListDto, UserNotificationStatusUpdateDto } from './user.dto';

@ApiTags('Users Docs')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Post('checkEmailExisting')
  checkEmailExisting(@Body() dto: UserCheckEmailExistDto) {
    return this.usersService.checkEmailExisting(dto);
  }

  @Post('checkMobileExisting')
  checkMobileExisting(@Body() dto: UserCheckMobileExistDto) {
    return this.usersService.checkMobileExisting(dto);
  }


  @Post('userFcmUpdate')
  userFcmUpdate(@Body() dto: UserFcmUpdateDto, @Request() req) {
    return this.usersService.userFcmUpdate(dto, req['_userId_']);
  }


  @Post('userNotificationStatusUpdate')
  userNotificationStatusUpdate(@Body() dto: UserNotificationStatusUpdateDto, @Request() req) {
    return this.usersService.userNotificationStatusUpdate(dto, req['_userId_']);
  }




  @Post('createUserNotification')
  createUserNotification(@Body() dto: UserNotificationCreatetDto) {
    return this.usersService.createUserNotification(dto);
  }
  
  @Post('listUserNotifications')
  listUserNotifications(@Body() dto: UserNotificationListDto, @Request() req) {
    return this.usersService.listUserNotifications(dto, req['_userId_']);
  }
}
