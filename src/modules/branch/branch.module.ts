import { Module } from '@nestjs/common';
import { BranchService } from './branch.service';
import { BranchController } from './branch.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { BranchSchema } from 'src/tableModels/branch.model';
import { CountersSchema } from 'src/tableModels/counters.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.BRANCHES,schema:BranchSchema},{name:ModelNames.COUNTERS,schema:CountersSchema}])],

  controllers: [BranchController],
  providers: [BranchService]
})
export class BranchModule {}
