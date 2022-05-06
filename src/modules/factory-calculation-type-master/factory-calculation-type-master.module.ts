import { Module } from '@nestjs/common';
import { FactoryCalculationTypeMasterService } from './factory-calculation-type-master.service';
import { FactoryCalculationTypeMasterController } from './factory-calculation-type-master.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { FactoryCalculationTypeMasterSchema } from 'src/tableModels/factory_calculation_type_master.model';
import { FactoryCalculationTypeMasterItemsSchema } from 'src/tableModels/factory_calculation_type_master_items.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ModelNames.FACTORY_CALCULATION_TYPE_MASTER,
        schema: FactoryCalculationTypeMasterSchema,
      },
      {
        name: ModelNames.FACTORY_CALCULATION_TYPE_MASTER_ITEMS,
        schema: FactoryCalculationTypeMasterItemsSchema,
      },
    ]),
  ],
  controllers: [FactoryCalculationTypeMasterController],
  providers: [FactoryCalculationTypeMasterService],
})
export class FactoryCalculationTypeMasterModule {}
