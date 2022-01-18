import { Module } from '@nestjs/common';
import { PurityService } from './purity.service';
import { PurityController } from './purity.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { PuritySchema } from 'src/tableModels/purity.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.PURITY,schema:PuritySchema}])],
  controllers: [PurityController],
  providers: [PurityService]
})
export class PurityModule {}
