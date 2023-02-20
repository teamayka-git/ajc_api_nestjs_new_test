import { Module } from '@nestjs/common';
import { AccountJournalService } from './account-journal.service';
import { AccountJournalController } from './account-journal.controller';
import { ModelNames } from 'src/common/model_names';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountJournalSchema } from 'src/tableModels/accountJournal.model';
import { JournalTransactionsSchema } from 'src/tableModels/accountJournalTransactions.model';

@Module({
  imports:[MongooseModule.forFeature([
    {name:ModelNames.ACCOUNT_JOURNAL,schema:AccountJournalSchema},
    { name: ModelNames.ACCOUNT_JOURNAL_ITEMS, schema: JournalTransactionsSchema },
  ])],
  controllers: [AccountJournalController],
  providers: [AccountJournalService]
})
export class AccountJournalModule {}
