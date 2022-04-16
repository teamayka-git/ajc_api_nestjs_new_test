import { Module } from '@nestjs/common';
import { UserAttendanceService } from './user-attendance.service';
import { UserAttendanceController } from './user-attendance.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { UserAttendanceSchema } from 'src/tableModels/user_attendances.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.USER_ATTENDANCES, schema: UserAttendanceSchema },
    ]),
  ],
  controllers: [UserAttendanceController],
  providers: [UserAttendanceService],
})
export class UserAttendanceModule {}
