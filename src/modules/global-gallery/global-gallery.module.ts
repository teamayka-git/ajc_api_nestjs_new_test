import { Module } from '@nestjs/common';
import { GlobalGalleryService } from './global-gallery.service';
import { GlobalGalleryController } from './global-gallery.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { GlobalGalleriesSchema } from 'src/tableModels/globalGalleries.model';
import { CountersSchema } from 'src/tableModels/counters.model';

@Module({
  imports:[MongooseModule.forFeature([
    {name:ModelNames.GLOBAL_GALLERIES,schema:GlobalGalleriesSchema},
    {name:ModelNames.COUNTERS,schema:CountersSchema}
  ])],
  controllers: [GlobalGalleryController],
  providers: [GlobalGalleryService]
})
export class GlobalGalleryModule {}
