
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
import { UserCheckEmailExistDto, UserCheckMobileExistDto } from './user.dto';

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
}
