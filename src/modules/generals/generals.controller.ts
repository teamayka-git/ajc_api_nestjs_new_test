import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GeneralsCreateDto, GeneralsEditDto, GeneralsListDto, GeneralsStatusChangeDto } from './generals.dto';
import { GeneralsService } from './generals.service';

@ApiTags("General Docs") 
@Controller('generals')
export class GeneralsController {
  constructor(private readonly generalsService: GeneralsService) {}

  @Post()
  create(@Body() dto: GeneralsCreateDto,@Request() req) {
    return this.generalsService.create(dto,req["_user_id_"]);
  }
  
  @Put()
  edit(@Body() dto: GeneralsEditDto,@Request() req) {
    return this.generalsService.edit(dto,req["_user_id_"]);
  }
  @Delete()
  status_change(@Body() dto: GeneralsStatusChangeDto,@Request() req) {
    return this.generalsService.status_change(dto,req["_user_id_"]);
  }
  
  @Post("list")
  list(@Body() dto:GeneralsListDto) {
    return this.generalsService.list(dto);
  }


}
