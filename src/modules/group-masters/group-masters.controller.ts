import { Controller } from '@nestjs/common';
import { GroupMastersService } from './group-masters.service';

@Controller('group-masters')
export class GroupMastersController {
  constructor(private readonly groupMastersService: GroupMastersService) {}
}
