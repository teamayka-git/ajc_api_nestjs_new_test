import { Module } from '@nestjs/common';
import { TestChargeMastersService } from './test-charge-masters.service';
import { TestChargeMastersController } from './test-charge-masters.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { TestChargersMastersStoneSchema } from 'src/tableModels/testChargeMasters.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.TEST_CHARGE_MASTERS,schema:TestChargersMastersStoneSchema}])],
  controllers: [TestChargeMastersController],
  providers: [TestChargeMastersService]
})
export class TestChargeMastersModule {}
