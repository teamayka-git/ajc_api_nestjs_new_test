import { Module } from '@nestjs/common';
import { GlobalGalleryCategoryService } from './global-gallery-category.service';
import { GlobalGalleryCategoryController } from './global-gallery-category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalGalleryCategoriesSchema } from 'src/tableModels/globalGallerycategories.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.GLOBAL_GALLERY_CATEGORIES,schema:GlobalGalleryCategoriesSchema}])],
  controllers: [GlobalGalleryCategoryController],
  providers: [GlobalGalleryCategoryService]
})
export class GlobalGalleryCategoryModule {}
