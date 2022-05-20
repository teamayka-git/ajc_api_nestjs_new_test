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
import { OrderSalesSchema } from 'src/tableModels/order_sales.model';
import { OrderSaleHistoriesSchema } from 'src/tableModels/order_sale_histories.model';
import { PhotographerRequestsSchema } from 'src/tableModels/photographer_requests.model';
import { HalmarkingRequestsSchema } from 'src/tableModels/halmarking_requests.model';
import { DepartmentsSchema } from 'src/tableModels/departments.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.PRODUCTS, schema: ProductsSchema },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
      { name: ModelNames.SUB_CATEGORIES, schema: SubCategoriesSchema },
      { name: ModelNames.PHOTOGRAPHER_REQUESTS, schema:PhotographerRequestsSchema },
      { name: ModelNames.HALMARKING_REQUESTS, schema:HalmarkingRequestsSchema },
      {
        name: ModelNames.PRODUCT_STONE_LINKIGS,
        schema: ProductStoneLinkingsSchema,
      },{name:ModelNames.DEPARTMENT,schema:DepartmentsSchema},
      { name: ModelNames.ORDER_SALES, schema: OrderSalesSchema },
      {
        name: ModelNames.ORDER_SALE_HISTORIES,
        schema: OrderSaleHistoriesSchema,
      },
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
