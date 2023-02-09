import { Module } from '@nestjs/common';
import { AccountGroupService } from './account-group.service';
import { AccountGroupController } from './account-group.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { AccountGroupSchema } from 'src/tableModels/accountGroup.model';//

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.ACCOUNT_GROUP,schema:AccountGroupSchema}])],
  controllers: [AccountGroupController],
  providers: [AccountGroupService]
})
export class AccountGroupModule {}
