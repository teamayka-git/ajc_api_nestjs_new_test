import { Module } from '@nestjs/common';
import { CronJobSchedulerServiceService } from './cron-job-scheduler-service.service';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { GlobalConfig } from 'src/config/global_config';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { UserSchema } from 'src/tableModels/user.model';
import { UserNotificationsSchema } from 'src/tableModels/user_notifications.model';
import { DepartmentsSchema } from 'src/tableModels/departments.model';

@Module({
  imports:[
    ScheduleModule.forRoot(),
    JwtModule.register({
      secret: GlobalConfig().JWT_SECRET_KEY,
      signOptions: {},
    }), //jwt implement
    MongooseModule.forFeature([
      { name: ModelNames.USER, schema: UserSchema },
      { name: ModelNames.USER_NOTIFICATIONS, schema: UserNotificationsSchema },
      
      { name: ModelNames.DEPARTMENT, schema: DepartmentsSchema },
    ]),
 
  ],
  controllers: [],
  providers: [CronJobSchedulerServiceService]
})
export class CronJobSchedulerModule {}
