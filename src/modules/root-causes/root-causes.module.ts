import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { RootCausesSchema } from 'src/tableModels/rootCause.model';
import { RootCausesController } from './root-causes.controller';
import { RootCausesService } from './root-causes.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelNames.ROOT_CAUSES, schema: RootCausesSchema },
    ]),
  ],
  controllers: [RootCausesController],
  providers: [RootCausesService],
})
export class RootCausesModule {}
