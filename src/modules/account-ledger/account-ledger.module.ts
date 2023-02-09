import { Module } from '@nestjs/common';
import { AccountLedgerService } from './account-ledger.service';
import { AccountLedgerController } from './account-ledger.controller';
import { ModelNames } from 'src/common/model_names';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountLedgerSchema } from 'src/tableModels/account_ledger.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.ACCOUNT_LEDGER,schema:AccountLedgerSchema}])],
  controllers: [AccountLedgerController],
  providers: [AccountLedgerService]
})
export class AccountLedgerModule {}
