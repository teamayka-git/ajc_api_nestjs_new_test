import { Module } from '@nestjs/common';
import { StorePromotionsService } from './store-promotions.service';
import { StorePromotionsController } from './store-promotions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { StorePromotionsSchema } from 'src/tableModels/store_promotions.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { GlobalGalleriesSchema } from 'src/tableModels/globalGalleries.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.STORE_PROMOTIONS, schema: StorePromotionsSchema },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
      { name: ModelNames.GLOBAL_GALLERIES, schema: GlobalGalleriesSchema },
    ]),
  ],
  controllers: [StorePromotionsController],
  providers: [StorePromotionsService],
})
export class StorePromotionsModule {}
