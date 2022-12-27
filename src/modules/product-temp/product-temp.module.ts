import { Module } from '@nestjs/common';
import { ProductTempService } from './product-temp.service';
import { ProductTempController } from './product-temp.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { ProductTempsSchema } from 'src/tableModels/product_temps.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { ProductTempStoneLinkingsSchema } from 'src/tableModels/product_temp_stone_linkings.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.PRODUCT_TEMPS, schema: ProductTempsSchema },
      { name: ModelNames.PRODUCT_STONE_LINKING_TEMPS, schema: ProductTempStoneLinkingsSchema },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
    ]),
  ],
  controllers: [ProductTempController],
  providers: [ProductTempService]
})
export class ProductTempModule {}
