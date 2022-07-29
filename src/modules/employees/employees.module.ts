import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { ModelNames } from 'src/common/model_names';
import { CountersSchema } from 'src/tableModels/counters.model';
import { EmployeeSchema } from 'src/tableModels/employee.model';
import { UserSchema } from 'src/tableModels/user.model';
import { JwtModule } from '@nestjs/jwt';
import { GlobalConfig } from 'src/config/global_config';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalGalleriesSchema } from 'src/tableModels/globalGalleries.model';
import { GoldRateTimelinesSchema } from 'src/tableModels/gold_rate_timelines.model';

@Module({  imports: [
  JwtModule.register({
    secret: GlobalConfig().JWT_SECRET_KEY,
    signOptions: {},
  }), //jwt implement
  MongooseModule.forFeature([
    { name: ModelNames.USER, schema: UserSchema },
    { name: ModelNames.EMPLOYEES, schema: EmployeeSchema },
    { name: ModelNames.COUNTERS, schema: CountersSchema },
    { name: ModelNames.GOLD_RATE_TIMELINES, schema:GoldRateTimelinesSchema },

    
    {name:ModelNames.GLOBAL_GALLERIES,schema:GlobalGalleriesSchema},
  ]),
],
  controllers: [EmployeesController],
  providers: [EmployeesService]
})
export class EmployeesModule {}
