import { Module } from '@nestjs/common';
import { DeliveryTempService } from './delivery-temp.service';
import { DeliveryTempController } from './delivery-temp.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { DeliveryTempSchema } from 'src/tableModels/delivery_temp.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.DELIVERY_TEMP, schema: DeliveryTempSchema },
    ]),
  ],
  controllers: [DeliveryTempController],
  providers: [DeliveryTempService],
})
export class DeliveryTempModule {}
