import { Module } from '@nestjs/common';
import { PhotographyRequestService } from './photography-request.service';
import { PhotographyRequestController } from './photography-request.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { PhotographerRequestsSchema } from 'src/tableModels/photographer_requests.model';
import { GlobalGalleriesSchema } from 'src/tableModels/globalGalleries.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { ProductsDocumentsSchema } from 'src/tableModels/products_documents.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ModelNames.PHOTOGRAPHER_REQUESTS,
        schema: PhotographerRequestsSchema,
      },
      { name: ModelNames.PRODUCT_DOCUMENTS_LINKIGS, schema: ProductsDocumentsSchema },
      { name: ModelNames.GLOBAL_GALLERIES, schema: GlobalGalleriesSchema },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
    ]),
  ],
  controllers: [PhotographyRequestController],
  providers: [PhotographyRequestService],
})
export class PhotographyRequestModule {}
