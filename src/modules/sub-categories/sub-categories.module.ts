import { Module } from '@nestjs/common';
import { SubCategoriesService } from './sub-categories.service';
import { SubCategoriesController } from './sub-categories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { SubCategoriesSchema } from 'src/tableModels/sub_categories.model';
import { GlobalGalleriesSchema } from 'src/tableModels/globalGalleries.model';
import { CountersSchema } from 'src/tableModels/counters.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.SUB_CATEGORIES,schema:SubCategoriesSchema},
    {name:ModelNames.GLOBAL_GALLERIES,schema:GlobalGalleriesSchema},
    { name: ModelNames.COUNTERS, schema: CountersSchema },])],
  controllers: [SubCategoriesController],
  providers: [SubCategoriesService]
})
export class SubCategoriesModule {}
