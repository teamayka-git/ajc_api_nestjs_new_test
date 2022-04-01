import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { CategoriesSchema } from 'src/tableModels/categories.model';
import { GlobalGalleriesSchema } from 'src/tableModels/globalGalleries.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { FilesS3Service } from 'src/s3_services/file.s3.services';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.CATEGORIES, schema: CategoriesSchema },
      { name: ModelNames.GLOBAL_GALLERIES, schema: GlobalGalleriesSchema },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
    ]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService, FilesS3Service],
})
export class CategoriesModule {}
