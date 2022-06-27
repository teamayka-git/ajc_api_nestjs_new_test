import { Module } from '@nestjs/common';
import { TestChargeService } from './test-charge.service';
import { TestChargeController } from './test-charge.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { TestChargersMastersSchema } from 'src/tableModels/test_charge_masters.model';
import { TestChargePercentagesSchema } from 'src/tableModels/test_charge_masters_percentages.model';


@Module({
  imports:[MongooseModule.forFeature([
    {name:ModelNames.TEST_CHARGE_MASTERS,schema:TestChargersMastersSchema},
    {name:ModelNames.TEST_CHARGE_ITEMS_MASTERS,schema:TestChargePercentagesSchema},
  ])],
  controllers: [TestChargeController],
  providers: [TestChargeService]
})
export class TestChargeModule {}
