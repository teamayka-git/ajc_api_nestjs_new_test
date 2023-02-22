import { Module } from '@nestjs/common';
import { AccountCurrencyService } from './account-currency.service';
import { AccountCurrencyController } from './account-currency.controller';
import { ModelNames } from 'src/common/model_names';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountCurrencySchema } from 'src/tableModels/accountCurrency.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.ACCOUNT_CURRENCY,schema:AccountCurrencySchema}])],
  controllers: [AccountCurrencyController],
  providers: [AccountCurrencyService]
})
export class AccountCurrencyModule {}
