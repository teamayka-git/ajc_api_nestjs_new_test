import { Module } from '@nestjs/common';
import { ProcessMasterService } from './process-master.service';
import { ProcessMasterController } from './process-master.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { ProcessMasterSchema } from 'src/tableModels/processMaster.model';
import { SubProcessMasterSchema } from 'src/tableModels/subProcessMaster.model';

@Module({
  imports:[MongooseModule.forFeature([
    {name:ModelNames.PROCESS_MASTER,schema:ProcessMasterSchema},
    {name:ModelNames.SUB_PROCESS_MASTER,schema:SubProcessMasterSchema},
  ])],
  controllers: [ProcessMasterController],
  providers: [ProcessMasterService]
})
export class ProcessMasterModule {}
