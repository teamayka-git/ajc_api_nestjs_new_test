import { Module } from '@nestjs/common';
import { DeliveryHubsService } from './delivery-hubs.service';
import { DeliveryHubsController } from './delivery-hubs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { DeliveryHubsSchema } from 'src/tableModels/deliveryHubs.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.DELIVERY_HUBS,schema:DeliveryHubsSchema}])],
  controllers: [DeliveryHubsController],
  providers: [DeliveryHubsService]
})
export class DeliveryHubsModule {}
