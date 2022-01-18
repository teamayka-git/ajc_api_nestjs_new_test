import { Module } from '@nestjs/common';
import { UnitMastersService } from './unit-masters.service';
import { UnitMastersController } from './unit-masters.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { UnitMasterSchema } from 'src/tableModels/unitMaster.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.UNIT_MASTER,schema:UnitMasterSchema}])],
  controllers: [UnitMastersController],
  providers: [UnitMastersService]
})
export class UnitMastersModule {}
