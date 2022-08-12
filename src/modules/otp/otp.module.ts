import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { OtpSchema } from 'src/tableModels/otp.model';
import { UserSchema } from 'src/tableModels/user.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.OTP, schema: OtpSchema },
      { name: ModelNames.USER, schema: UserSchema },
    ]),
  ],
  controllers: [OtpController],
  providers: [OtpService]
})
export class OtpModule {}
