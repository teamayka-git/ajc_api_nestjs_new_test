import { Module } from '@nestjs/common';
import { GroupMastersService } from './group-masters.service';
import { GroupMastersController } from './group-masters.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { GroupMastersSchema } from 'src/tableModels/groupMasters.model';

@Module({
  imports:[MongooseModule.forFeature([{name:ModelNames.GROUP_MASTERS,schema:GroupMastersSchema}])],
  controllers: [GroupMastersController],
  providers: [GroupMastersService]
})
export class GroupMastersModule {}
