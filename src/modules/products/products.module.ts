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
import { OrderSaleHistoriesSchema } from 'src/tableModels/order_sale_histories.model';
import { PhotographerRequestsSchema } from 'src/tableModels/photographer_requests.model';
import { DepartmentsSchema } from 'src/tableModels/departments.model';
import { OrderSalesMainSchema } from 'src/tableModels/order_sales_main.model';
import { OrderSalesItemsSchema } from 'src/tableModels/order_sales_items.model';
import { ProductTagLinkingsSchema } from 'src/tableModels/product_tag_linkings.model';
import { ProductsDocumentsSchema } from 'src/tableModels/products_documents.model';
import { GlobalGalleriesSchema } from 'src/tableModels/globalGalleries.model';
import { ProductTempsSchema } from 'src/tableModels/product_temps.model';
import { HalmarkOrderItemsSchema } from 'src/tableModels/halmark_order_items.model';
import { HalmarkOrderMainSchema } from 'src/tableModels/halmark_order_mains.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.PRODUCTS, schema: ProductsSchema },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
      { name: ModelNames.SUB_CATEGORIES, schema: SubCategoriesSchema },
      { name: ModelNames.PHOTOGRAPHER_REQUESTS, schema:PhotographerRequestsSchema },
      {
        name: ModelNames.PRODUCT_STONE_LINKIGS,
        schema: ProductStoneLinkingsSchema,
      },{name:ModelNames.DEPARTMENT,schema:DepartmentsSchema},
      { name: ModelNames.ORDER_SALES_MAIN, schema: OrderSalesMainSchema },
      { name: ModelNames.ORDER_SALES_ITEMS, schema: OrderSalesItemsSchema },
      { name: ModelNames.PRODUCT_TAG_LINKINGS, schema: ProductTagLinkingsSchema },
      { name: ModelNames.PRODUCT_DOCUMENTS_LINKIGS, schema: ProductsDocumentsSchema },
      { name: ModelNames.GLOBAL_GALLERIES, schema: GlobalGalleriesSchema },
      {
        name: ModelNames.ORDER_SALE_HISTORIES,
        schema: OrderSaleHistoriesSchema,
      },

      { name: ModelNames.PRODUCT_TEMPS, schema: ProductTempsSchema },


      { name: ModelNames.HALMARK_ORDER_MAIN, schema: HalmarkOrderMainSchema },
      { name: ModelNames.HALMARK_ORDER_ITEMS, schema: HalmarkOrderItemsSchema },




    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
