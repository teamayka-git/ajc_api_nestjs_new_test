import { Module } from '@nestjs/common';
import { StatesService } from './states.service';
import { StatesController } from './states.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { StatesSchema } from 'src/tableModels/states.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.STATES,schema:StatesSchema}])],
  controllers: [StatesController],
  providers: [StatesService]
})
export class StatesModule {}
