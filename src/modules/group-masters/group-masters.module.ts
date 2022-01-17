import { Module } from '@nestjs/common';
import { GroupMastersService } from './group-masters.service';
import { GroupMastersController } from './group-masters.controller';

@Module({
  controllers: [GroupMastersController],
  providers: [GroupMastersService]
})
export class GroupMastersModule {}
