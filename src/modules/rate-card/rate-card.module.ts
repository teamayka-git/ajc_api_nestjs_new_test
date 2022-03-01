import { Module } from '@nestjs/common';
import { RateCardService } from './rate-card.service';
import { RateCardController } from './rate-card.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { RateCardsSchema } from 'src/tableModels/rateCards.model';
import { RateCardPercentagesSchema } from 'src/tableModels/rateCardPercentages.model';

@Module({
  imports:[MongooseModule.forFeature([
    {name:ModelNames.RATE_CARDS,schema:RateCardsSchema},
    {name:ModelNames.RATE_CARD_PERCENTAGESS,schema:RateCardPercentagesSchema},
  ])],
  controllers: [RateCardController],
  providers: [RateCardService]
})
export class RateCardModule {}
