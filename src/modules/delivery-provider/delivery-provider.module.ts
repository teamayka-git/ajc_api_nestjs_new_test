import { Module } from '@nestjs/common';
import { DeliveryProviderService } from './delivery-provider.service';
import { DeliveryProviderController } from './delivery-provider.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { DeliveryProvidersSchema } from 'src/tableModels/delivery_providers.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.DELIVERY_PROVIDER, schema: DeliveryProvidersSchema },
    ]),
  ],
  controllers: [DeliveryProviderController],
  providers: [DeliveryProviderService],
})
export class DeliveryProviderModule {}
