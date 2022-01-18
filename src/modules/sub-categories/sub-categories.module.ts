import { Module } from '@nestjs/common';
import { SubCategoriesService } from './sub-categories.service';
import { SubCategoriesController } from './sub-categories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { SubCategoriesSchema } from 'src/tableModels/sub_categories.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.SUB_CATEGORIES,schema:SubCategoriesSchema}])],
  controllers: [SubCategoriesController],
  providers: [SubCategoriesService]
})
export class SubCategoriesModule {}
