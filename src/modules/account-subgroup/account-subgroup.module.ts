import { Module } from '@nestjs/common';
import { AccountSubgroupService } from './account-Subgroup.service';
import { AccountSubgroupController } from './account-Subgroup.controller';
import { ModelNames } from 'src/common/model_names';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountSubgroupSchema } from 'src/tableModels/account_Subgroup.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.ACCOUNT_SUBGROUP,schema:AccountSubgroupSchema}])],
  controllers: [AccountSubgroupController],
  providers: [AccountSubgroupService]
})
export class AccountSubgroupModule {}//
