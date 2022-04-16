import { Module } from '@nestjs/common';
import { HalmarkCentersService } from './halmark-centers.service';
import { HalmarkCentersController } from './halmark-centers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { HalmarkCenterSchema } from 'src/tableModels/halmarkCenter.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { UserSchema } from 'src/tableModels/user.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.HALMARK_CENTERS, schema: HalmarkCenterSchema },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
      { name: ModelNames.USER, schema: UserSchema },
    ]),
  ],
  controllers: [HalmarkCentersController],
  providers: [HalmarkCentersService],
})
export class HalmarkCentersModule {}
