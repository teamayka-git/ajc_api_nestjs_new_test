import { Body, Controller, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GoldRateTimelinesService } from './gold-rate-timelines.service';
import { GoldRateTimelinesCreateDto, GoldRateTimelinesListDto } from './gold_rate_timelines.dto';


@ApiTags("Gold rate timelines Docs") 
@Controller('gold-rate-timelines')
export class GoldRateTimelinesController {
  constructor(private readonly goldRateTimelinesService: GoldRateTimelinesService) {}


  @Post()
  create(@Body() dto: GoldRateTimelinesCreateDto,@Request() req) {
    return this.goldRateTimelinesService.create(dto,req["_user_id_"]);
  }

  
  @Post("list")
  list(@Body() dto:GoldRateTimelinesListDto) {
    return this.goldRateTimelinesService.list(dto);
  }



}
