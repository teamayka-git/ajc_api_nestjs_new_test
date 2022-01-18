import { Module } from '@nestjs/common';
import { StoneService } from './stone.service';
import { StoneController } from './stone.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { StoneSchema } from 'src/tableModels/stone.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.STONE,schema:StoneSchema}])],
  controllers: [StoneController],
  providers: [StoneService]
})
export class StoneModule {}
