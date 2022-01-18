import { Module } from '@nestjs/common';
import { TransportMastersService } from './transport-masters.service';
import { TransportMastersController } from './transport-masters.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { TransportMastersSchema } from 'src/tableModels/transportMasters.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.TRANSPORT_MASTERS,schema:TransportMastersSchema}])],
  controllers: [TransportMastersController],
  providers: [TransportMastersService]
})
export class TransportMastersModule {}
