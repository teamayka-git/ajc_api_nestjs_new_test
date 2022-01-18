import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { CategoriesSchema } from 'src/tableModels/categories.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.CATEGORIES,schema:CategoriesSchema}])],
  controllers: [CategoriesController],
  providers: [CategoriesService]
})
export class CategoriesModule {}
