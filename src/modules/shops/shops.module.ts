import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GlobalConfig } from 'src/config/global_config';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { UserSchema } from 'src/tableModels/user.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { ShopsSchema } from 'src/tableModels/shops.model';
import { GlobalGalleriesSchema } from 'src/tableModels/globalGalleries.model';
import { GlobalGalleryCategoriesSchema } from 'src/tableModels/globalGallerycategories.model';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';
import { CustomersSchema } from 'src/tableModels/customers.model';
import { GeneralsSchema } from 'src/tableModels/generals.model';
import { CompanySchema } from 'src/tableModels/companies.model';

@Module({
  imports: [
    JwtModule.register({
      secret: GlobalConfig().JWT_SECRET_KEY,
      signOptions: {},
    }), //jwt implement
    MongooseModule.forFeature([
      { name: ModelNames.USER, schema: UserSchema },
      { name: ModelNames.SHOPS, schema: ShopsSchema },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
      { name: ModelNames.CUSTOMERS, schema: CustomersSchema },
      { name: ModelNames.GENERALS, schema: GeneralsSchema },{name:ModelNames.COMPANIES,schema:CompanySchema},
      {
        name: ModelNames.GLOBAL_GALLERY_CATEGORIES,
        schema: GlobalGalleryCategoriesSchema,
      },

      { name: ModelNames.GLOBAL_GALLERIES, schema: GlobalGalleriesSchema },
    ]),
  ],
  controllers: [ShopsController],
  providers: [ShopsService],
})
export class ShopsModule {}
