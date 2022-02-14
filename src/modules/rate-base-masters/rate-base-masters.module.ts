import { Module } from '@nestjs/common';
import { RateBaseMastersService } from './rate-base-masters.service';
import { RateBaseMastersController } from './rate-base-masters.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { RateBaseMasterSchema } from 'src/tableModels/rateBaseMasters.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.RATE_BASE_MASTERS,schema:RateBaseMasterSchema}])],
  controllers: [RateBaseMastersController],
  providers: [RateBaseMastersService]
})
export class RateBaseMastersModule {}
