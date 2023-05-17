import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtModule } from '@nestjs/jwt';
import { GlobalConfig } from 'src/config/global_config';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { UserSchema } from 'src/tableModels/user.model';
import { UserNotificationsSchema } from 'src/tableModels/user_notifications.model';

@Module({
  imports: [
    JwtModule.register({
      secret: GlobalConfig().JWT_SECRET_KEY,
      signOptions: {},
    }), //jwt implement
    MongooseModule.forFeature([
      { name: ModelNames.USER, schema: UserSchema },
      { name: ModelNames.USER_NOTIFICATIONS, schema: UserNotificationsSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
