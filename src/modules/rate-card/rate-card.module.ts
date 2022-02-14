import { Module } from '@nestjs/common';
import { RateCardService } from './rate-card.service';
import { RateCardController } from './rate-card.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { RateCardsSchema } from 'src/tableModels/rateCards.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.RATE_CARDS,schema:RateCardsSchema}])],
  controllers: [RateCardController],
  providers: [RateCardService]
})
export class RateCardModule {}
