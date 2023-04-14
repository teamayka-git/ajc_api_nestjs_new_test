
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
import { UserCheckEmailExistDto, UserCheckMobileExistDto, UserNotificationCreatetDto, UserNotificationListDto } from './user.dto';

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
  @Post('createUserNotification')
  createUserNotification(@Body() dto: UserNotificationCreatetDto) {
    return this.usersService.createUserNotification(dto);
  }
  
  @Post('listUserNotifications')
  listUserNotifications(@Body() dto: UserNotificationListDto) {
    return this.usersService.listUserNotifications(dto);
  }
}
