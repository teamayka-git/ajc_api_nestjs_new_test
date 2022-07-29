import { Module } from '@nestjs/common';
import { SubCategoriesService } from './sub-categories.service';
import { SubCategoriesController } from './sub-categories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { SubCategoriesSchema } from 'src/tableModels/sub_categories.model';
import { GlobalGalleriesSchema } from 'src/tableModels/globalGalleries.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { RateCardsSchema } from 'src/tableModels/rateCards.model';
import { RateCardPercentagesSchema } from 'src/tableModels/rateCardPercentages.model';
import { GeneralsSchema } from 'src/tableModels/generals.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.SUB_CATEGORIES, schema: SubCategoriesSchema },
      { name: ModelNames.GLOBAL_GALLERIES, schema: GlobalGalleriesSchema },
      { name: ModelNames.RATE_CARDS, schema: RateCardsSchema },
      {
        name: ModelNames.RATE_CARD_PERCENTAGESS,
        schema: RateCardPercentagesSchema,
      },
      { name: ModelNames.GENERALS, schema: GeneralsSchema },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
    ]),
  ],
  controllers: [SubCategoriesController],
  providers: [SubCategoriesService],
})
export class SubCategoriesModule {}
