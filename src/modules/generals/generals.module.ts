import { Module } from '@nestjs/common';
import { GeneralsService } from './generals.service';
import { GeneralsController } from './generals.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { GeneralsSchema } from 'src/tableModels/generals.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.GENERALS,schema:GeneralsSchema}])],
  controllers: [GeneralsController],
  providers: [GeneralsService]
})
export class GeneralsModule {}
