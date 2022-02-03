import { Module } from '@nestjs/common';
import { StoneService } from './stone.service';
import { StoneController } from './stone.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { StoneSchema } from 'src/tableModels/stone.model';
import { GlobalGalleriesSchema } from 'src/tableModels/globalGalleries.model';
import { CountersSchema } from 'src/tableModels/counters.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.STONE,schema:StoneSchema},
    {name:ModelNames.GLOBAL_GALLERIES,schema:GlobalGalleriesSchema},
    { name: ModelNames.COUNTERS, schema: CountersSchema },])],
  controllers: [StoneController],
  providers: [StoneService]
})
export class StoneModule {}
