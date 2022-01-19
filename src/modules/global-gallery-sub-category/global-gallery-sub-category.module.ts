import { Module } from '@nestjs/common';
import { GlobalGallerySubCategoryService } from './global-gallery-sub-category.service';
import { GlobalGallerySubCategoryController } from './global-gallery-sub-category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalGallerySubCategoryStatusChangeDto } from './global_gallery_sub_category.dto';
import { GlobalGallerySubCategoriesSchema } from 'src/tableModels/globalGallerySubCategories.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.GLOBAL_GALLERY_SUB_CATEGORIES,schema:GlobalGallerySubCategoriesSchema}])],
  controllers: [GlobalGallerySubCategoryController],
  providers: [GlobalGallerySubCategoryService]
})
export class GlobalGallerySubCategoryModule {}
