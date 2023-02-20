import { Module } from '@nestjs/common';
import { AccountSubgroupService } from './account-subgroup.service';
import { AccountSubgroupController } from './account-subgroup.controller';
import { ModelNames } from 'src/common/model_names';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountSubgroupSchema } from 'src/tableModels/accountSubgroup.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.ACCOUNT_SUBGROUP,schema:AccountSubgroupSchema}])],
  controllers: [AccountSubgroupController],
  providers: [AccountSubgroupService]
})
export class AccountSubgroupModule {}//
