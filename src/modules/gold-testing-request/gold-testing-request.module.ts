import { Module } from '@nestjs/common';
import { GoldTestingRequestService } from './gold-testing-request.service';
import { GoldTestingRequestController } from './gold-testing-request.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { GoldTestRequestsSchema } from 'src/tableModels/gold_testing_requests.model';
import { GoldTestRequestItemsSchema } from 'src/tableModels/gold_testing_request_items.model';
import { CountersSchema } from 'src/tableModels/counters.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ModelNames.GOLD_TESTING_REQUESTS,
        schema: GoldTestRequestsSchema,
      },
      {
        name: ModelNames.GOLD_TESTING_REQUEST_ITEMS,
        schema: GoldTestRequestItemsSchema,
      },
      {
        name: ModelNames.COUNTERS,
        schema: CountersSchema,
      },
    ]),
  ],
  controllers: [GoldTestingRequestController],
  providers: [GoldTestingRequestService],
})
export class GoldTestingRequestModule {}
