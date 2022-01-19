import { Module } from '@nestjs/common';
import { GlobalGalleryService } from './global-gallery.service';
import { GlobalGalleryController } from './global-gallery.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalGalleriesSchema } from 'src/tableModels/globalGalleries.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.GLOBAL_GALLERIES,schema:GlobalGalleriesSchema}])],
  controllers: [GlobalGalleryController],
  providers: [GlobalGalleryService]
})
export class GlobalGalleryModule {}
