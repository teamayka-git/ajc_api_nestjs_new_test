import { Module } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';
import { JwtModule } from '@nestjs/jwt';
import { GlobalConfig } from 'src/config/global_config';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { SuppliersSchema } from 'src/tableModels/suppliers.model';
import { UserSchema } from 'src/tableModels/user.model';
import { CountersSchema } from 'src/tableModels/counters.model';
import { GlobalGalleriesSchema } from 'src/tableModels/globalGalleries.model';
import { AccountLedgerSchema } from 'src/tableModels/accountLedger.model';
import { AccountSubgroupSchema } from 'src/tableModels/accountSubgroup.model';

@Module({ imports: [
  JwtModule.register({
    secret: GlobalConfig().JWT_SECRET_KEY,
    signOptions: {},
  }), //jwt implement
  MongooseModule.forFeature([
    { name: ModelNames.USER, schema: UserSchema },
    { name: ModelNames.SUPPLIERS, schema: SuppliersSchema },
    { name: ModelNames.COUNTERS, schema: CountersSchema },
    {name:ModelNames.GLOBAL_GALLERIES,schema:GlobalGalleriesSchema},
    {name:ModelNames.ACCOUNT_LEDGER,schema:AccountLedgerSchema},
    {name:ModelNames.ACCOUNT_SUBGROUP,schema:AccountSubgroupSchema},
  ]),
],
  controllers: [SupplierController],
  providers: [SupplierService]
})
export class SupplierModule {}
