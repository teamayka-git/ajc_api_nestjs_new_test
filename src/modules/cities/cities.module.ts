import { Module } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { CitiesSchema } from 'src/tableModels/cities.model';
import { CompanySchema } from 'src/tableModels/companies.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.CITIES,schema:CitiesSchema},{name:ModelNames.COMPANIES,schema:CompanySchema}])],
  controllers: [CitiesController],
  providers: [CitiesService]
})
export class CitiesModule {}
