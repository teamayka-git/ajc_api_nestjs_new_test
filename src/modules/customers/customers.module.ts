import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { JwtModule } from '@nestjs/jwt';
import { GlobalConfig } from 'src/config/global_config';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { UserSchema } from 'src/tableModels/user.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { CustomersSchema } from 'src/tableModels/customers.model';
import { GlobalGalleriesSchema } from 'src/tableModels/globalGalleries.model';

@Module({imports: [
  JwtModule.register({
    secret: GlobalConfig().JWT_SECRET_KEY,
    signOptions: {},
  }), //jwt implement
  MongooseModule.forFeature([
    { name: ModelNames.USER, schema: UserSchema },
    { name: ModelNames.CUSTOMERS, schema: CustomersSchema},
    { name: ModelNames.COUNTERS, schema: CountersSchema },

    
    {name:ModelNames.GLOBAL_GALLERIES,schema:GlobalGalleriesSchema},
  ]),
],
  controllers: [CustomersController],
  providers: [CustomersService]
})
export class CustomersModule {}
