import { Module } from '@nestjs/common';
import { ProcessMasterService } from './process-master.service';
import { ProcessMasterController } from './process-master.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { ProcessMasterSchema } from 'src/tableModels/processMaster.model';

@Module({
  imports:[MongooseModule.forFeature([
    {name:ModelNames.PROCESS_MASTER,schema:ProcessMasterSchema},
    {name:ModelNames.PROCESS_MASTER,schema:ProcessMasterSchema},
  ])],
  controllers: [ProcessMasterController],
  providers: [ProcessMasterService]
})
export class ProcessMasterModule {}
