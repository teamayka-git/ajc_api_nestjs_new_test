import { Module } from '@nestjs/common';
import { PhotographyRequestService } from './photography-request.service';
import { PhotographyRequestController } from './photography-request.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { PhotographerRequestsSchema } from 'src/tableModels/photographer_requests.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ModelNames.PHOTOGRAPHER_REQUESTS,
        schema: PhotographerRequestsSchema,
      },
    ]),
  ],
  controllers: [PhotographyRequestController],
  providers: [PhotographyRequestService],
})
export class PhotographyRequestModule {}
