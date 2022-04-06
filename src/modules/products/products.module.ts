import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { ProductsSchema } from 'src/tableModels/products.model';
import { ProductStoneLinkingsSchema } from 'src/tableModels/productStoneLinkings.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { CategoriesSchema } from 'src/tableModels/categories.model';
import { SubCategoriesSchema } from 'src/tableModels/sub_categories.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.PRODUCTS, schema: ProductsSchema },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
      { name: ModelNames.SUB_CATEGORIES, schema: SubCategoriesSchema },
      {
        name: ModelNames.PRODUCT_STONE_LINKIGS,
        schema: ProductStoneLinkingsSchema,
      },
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
