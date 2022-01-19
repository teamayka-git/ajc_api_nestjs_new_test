import { Module } from '@nestjs/common';
import { BanksService } from './banks.service';
import { BanksController } from './banks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { BankSchema } from 'src/tableModels/banks.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.BANKS,schema:BankSchema}])],
  controllers: [BanksController],
  providers: [BanksService]
})
export class BanksModule {}
