import { Body, Controller, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserAttendanceService } from './user-attendance.service';
import {
  UserAttendanceDto,
  UserAttendanceListDto,
} from './user_attendance.dto';

@ApiTags('User Attendance Docs')
@Controller('user-attendance')
export class UserAttendanceController {
  constructor(private readonly userAttendanceService: UserAttendanceService) {}

  @Post()
  create(@Body() dto: UserAttendanceDto, @Request() req) {
    return this.userAttendanceService.create(dto, req['_userId_']);
  }

  @Post('list')
  list(@Body() dto: UserAttendanceListDto, @Request() req) {
    return this.userAttendanceService.list(dto, req['_userId_']);
  }
}
