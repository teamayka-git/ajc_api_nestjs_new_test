import { Module } from '@nestjs/common';
import { FactoriesService } from './factories.service';
import { FactoriesController } from './factories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { FactorySchema } from 'src/tableModels/factory.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.FACTORIES,schema:FactorySchema}])],
  controllers: [FactoriesController],
  providers: [FactoriesService]
})
export class FactoriesModule {}
