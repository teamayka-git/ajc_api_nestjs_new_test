import { Module } from '@nestjs/common';
import { AccountHeadService } from './account-head.service';
import { AccountHeadController } from './account-head.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { AccountHeadSchema } from 'src/tableModels/account_head.model';//

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.ACCOUNT_HEAD,schema:AccountHeadSchema}])],
  controllers: [AccountHeadController],
  providers: [AccountHeadService]
})
export class AccountHeadModule {}
