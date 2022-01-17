import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { GoldRateTimelinesService } from './gold-rate-timelines.service';
import { GoldRateTimelinesCreateDto, GoldRateTimelinesListDto } from './gold_rate_timelines.dto';


@ApiTags("Gold rate timelines Docs") 
@Controller('gold-rate-timelines')
@UseGuards(RolesGuard)
export class GoldRateTimelinesController {
  constructor(private readonly goldRateTimelinesService: GoldRateTimelinesService) {}


  @Post()
  @Roles(GuardUserRole.SUPER_ADMIN)
  create(@Body() dto: GoldRateTimelinesCreateDto,@Request() req) {
    return this.goldRateTimelinesService.create(dto,req["_user_id_"]);
  }

  
  @Post("list")
  list(@Body() dto:GoldRateTimelinesListDto) {
    return this.goldRateTimelinesService.list(dto);
  }



}
