import { Module } from '@nestjs/common';
import { TdsMastersService } from './tds-masters.service';
import { TdsMastersController } from './tds-masters.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { TdsMastersSchema } from 'src/tableModels/tdsMasters.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.TDS_MASTERS,schema:TdsMastersSchema}])],
  controllers: [TdsMastersController],
  providers: [TdsMastersService]
})
export class TdsMastersModule {}
