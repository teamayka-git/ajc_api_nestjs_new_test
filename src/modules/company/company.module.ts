import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { CompanySchema } from 'src/tableModels/companies.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.COMPANIES,schema:CompanySchema}])],
  controllers: [CompanyController],
  providers: [CompanyService]
})
export class CompanyModule {}
