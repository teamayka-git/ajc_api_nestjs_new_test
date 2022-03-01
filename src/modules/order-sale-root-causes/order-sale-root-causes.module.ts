import { Module } from '@nestjs/common';
import { OrderSaleRootCausesService } from './order-sale-root-causes.service';
import { OrderSaleRootCausesController } from './order-sale-root-causes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { OrderSaleRootCausesSchema } from 'src/tableModels/orderSaleRootCause.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.ORDER_SALES_ROOT_CAUSES,schema:OrderSaleRootCausesSchema}])],
  controllers: [OrderSaleRootCausesController],
  providers: [OrderSaleRootCausesService]
})
export class OrderSaleRootCausesModule {}
