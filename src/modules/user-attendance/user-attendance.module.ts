import { Module } from '@nestjs/common';
import { UserAttendanceService } from './user-attendance.service';
import { UserAttendanceController } from './user-attendance.controller';

@Module({
  controllers: [UserAttendanceController],
  providers: [UserAttendanceService]
})
export class UserAttendanceModule {}
