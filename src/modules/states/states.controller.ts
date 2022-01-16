import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StatesCreateDto, StatesEditDto, StatesListDto, StatesStatusChangeDto } from './states.dto';
import { StatesService } from './states.service';






@ApiTags("State Docs") 
@Controller('states')
export class StatesController {
  constructor(private readonly statesService: StatesService) {}

  @Post()
  create(@Body() dto: StatesCreateDto,@Request() req) {
    return this.statesService.create(dto,req["_user_id_"]);
  }
  
  @Put()
  edit(@Body() dto: StatesEditDto,@Request() req) {
    return this.statesService.edit(dto,req["_user_id_"]);
  }
  @Delete()
  status_change(@Body() dto: StatesStatusChangeDto,@Request() req) {
    return this.statesService.status_change(dto,req["_user_id_"]);
  }
  
  @Post("list")
  list(@Body() dto:StatesListDto) {
    return this.statesService.list(dto);
  }



}
