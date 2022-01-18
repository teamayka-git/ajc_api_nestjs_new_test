import { Module } from '@nestjs/common';
import { TcsMastersService } from './tcs-masters.service';
import { TcsMastersController } from './tcs-masters.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { TcsMastersSchema } from 'src/tableModels/tcsMasters.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.TCS_MASTERS,schema:TcsMastersSchema}])],
  controllers: [TcsMastersController],
  providers: [TcsMastersService]
})
export class TcsMastersModule {}
