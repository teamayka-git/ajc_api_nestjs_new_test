import { Module } from '@nestjs/common';
import { BulkApiTempService } from './bulk-api-temp.service';
import { BulkApiTempController } from './bulk-api-temp.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { UserSchema } from 'src/tableModels/user.model';
import { StatesSchema } from 'src/tableModels/states.model';
import { DistrictsSchema } from 'src/tableModels/districts.model';
import { CitiesSchema } from 'src/tableModels/cities.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { BranchSchema } from 'src/tableModels/branch.model';
import { DepartmentsSchema } from 'src/tableModels/departments.model';
import { RateBaseMasterSchema } from 'src/tableModels/rateBaseMasters.model';
import { TdsMastersSchema } from 'src/tableModels/tdsMasters.model';
import { TcsMastersSchema } from 'src/tableModels/tcsMasters.model';
import { RateCardsSchema } from 'src/tableModels/rateCards.model';
import { RateCardPercentagesSchema } from 'src/tableModels/rateCardPercentages.model';
import { SubCategoriesSchema } from 'src/tableModels/sub_categories.model';
import { EmployeeSchema } from 'src/tableModels/employee.model';
import { ShopsSchema } from 'src/tableModels/shops.model';
import { CompanySchema } from 'src/tableModels/companies.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      
      { name: ModelNames.USER, schema: UserSchema },
      { name: ModelNames.STATES, schema: StatesSchema },
      { name: ModelNames.DISTRICTS, schema: DistrictsSchema },
      { name: ModelNames.CITIES, schema:CitiesSchema },
      { name: ModelNames.COUNTERS, schema:CountersSchema },
      { name: ModelNames.BRANCHES, schema:BranchSchema },
      { name: ModelNames.DEPARTMENT, schema:DepartmentsSchema },
      { name: ModelNames.RATE_BASE_MASTERS, schema:RateBaseMasterSchema },
      { name: ModelNames.TDS_MASTERS, schema:TdsMastersSchema },
      { name: ModelNames.TCS_MASTERS, schema:TcsMastersSchema },
      { name: ModelNames.RATE_CARDS, schema:RateCardsSchema },
      { name: ModelNames.RATE_CARD_PERCENTAGESS, schema:RateCardPercentagesSchema },
      { name: ModelNames.SUB_CATEGORIES, schema:SubCategoriesSchema },
      { name: ModelNames.EMPLOYEES, schema:EmployeeSchema },
      { name: ModelNames.SHOPS, schema:ShopsSchema },
      { name: ModelNames.COMPANIES, schema:CompanySchema },
    
    ]),
  ],
  controllers: [BulkApiTempController],
  providers: [BulkApiTempService],
})
export class BulkApiTempModule {}
