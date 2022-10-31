import { Module } from '@nestjs/common';
import { TagMastersService } from './tag-masters.service';
import { TagMastersController } from './tag-masters.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { TagMatersSchema } from 'src/tableModels/tag_masters.model';
import { TagMasterDocumentsSchema } from 'src/tableModels/tag_master_documents.model';
import { GlobalGalleriesSchema } from 'src/tableModels/globalGalleries.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { ProductTagLinkingsSchema } from 'src/tableModels/product_tag_linkings.model';

@Module({
  imports:[MongooseModule.forFeature([
    {name:ModelNames.TAG_MASTERS,schema:TagMatersSchema},
    {name:ModelNames.TAG_MASTER_DOCUMENTS,schema:TagMasterDocumentsSchema},
    {name:ModelNames.GLOBAL_GALLERIES,schema:GlobalGalleriesSchema},
    {name:ModelNames.COUNTERS,schema:CountersSchema},
    { name: ModelNames.PRODUCT_TAG_LINKINGS, schema: ProductTagLinkingsSchema },
  ])],

  controllers: [TagMastersController],
  providers: [TagMastersService]
})
export class TagMastersModule {}
