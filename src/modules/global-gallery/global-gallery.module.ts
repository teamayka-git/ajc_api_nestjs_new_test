import { Module } from '@nestjs/common';
import { GlobalGalleryService } from './global-gallery.service';
import { GlobalGalleryController } from './global-gallery.controller';

@Module({
  controllers: [GlobalGalleryController],
  providers: [GlobalGalleryService]
})
export class GlobalGalleryModule {}
