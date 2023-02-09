import { Module } from '@nestjs/common';
import { AccountSubgroupService } from './accountSubgroup.service';
import { AccountSubgroupController } from './accountSubgroup.controller';
import { ModelNames } from 'src/common/model_names';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountSubgroupSchema } from 'src/tableModels/accountSubgroup.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.ACCOUNT_SUBGROUP,schema:AccountSubgroupSchema}])],
  controllers: [AccountSubgroupController],
  providers: [AccountSubgroupService]
})
export class AccountSubgroupModule {}//
