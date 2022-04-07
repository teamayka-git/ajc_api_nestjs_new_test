import { Module } from '@nestjs/common';
import { ColourMastersService } from './colour-masters.service';
import { ColourMastersController } from './colour-masters.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { ColoursSchema } from 'src/tableModels/colourMasters.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.COLOUR_MASTERS, schema: ColoursSchema },
    ]),
  ],
  controllers: [ColourMastersController],
  providers: [ColourMastersService],
})
export class ColourMastersModule {}
