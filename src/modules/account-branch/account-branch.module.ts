import { Module } from '@nestjs/common';
import { AccountBranchService } from './account-branch.service';
import { AccountBranchController } from './account-branch.controller';
import { ModelNames } from 'src/common/model_names';
import { AccountBranchSchema } from 'src/tableModels/accountBranch.model';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.ACCOUNT_BRANCH,schema:AccountBranchSchema}])],
  controllers: [AccountBranchController],
  providers: [AccountBranchService]
})
export class AccountBranchModule {}
