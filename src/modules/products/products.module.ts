import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { ProductsSchema } from 'src/tableModels/products.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.PRODUCTS, schema: ProductsSchema },
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
