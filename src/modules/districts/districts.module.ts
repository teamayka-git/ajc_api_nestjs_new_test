import { Module } from '@nestjs/common';
import { DistrictsService } from './districts.service';
import { DistrictsController } from './districts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { DistrictsSchema } from 'src/tableModels/districts.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.DISTRICTS,schema:DistrictsSchema}])],
  controllers: [DistrictsController],
  providers: [DistrictsService]
})
export class DistrictsModule {}
