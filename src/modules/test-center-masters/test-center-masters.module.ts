import { Module } from '@nestjs/common';
import { TestCenterMastersService } from './test-center-masters.service';
import { TestCenterMastersController } from './test-center-masters.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { TestCenterMastersSchema } from 'src/tableModels/testCenterMasters.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.TEST_CENTER_MASTERS,schema:TestCenterMastersSchema}])],
  controllers: [TestCenterMastersController],
  providers: [TestCenterMastersService]
})
export class TestCenterMastersModule {}
