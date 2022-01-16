import { Body, Controller, Delete, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DistrictsCreateDto, DistrictsEditDto, DistrictsListDto, DistrictsStatusChangeDto } from './districts.dto';
import { DistrictsService } from './districts.service';


@ApiTags("Districts Docs") 
@Controller('districts')
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}

  @Post()
  create(@Body() dto: DistrictsCreateDto,@Request() req) {
    return this.districtsService.create(dto,req["_user_id_"]);
  }
  
  @Put()
  edit(@Body() dto: DistrictsEditDto,@Request() req) {
    return this.districtsService.edit(dto,req["_user_id_"]);
  }
  @Delete()
  status_change(@Body() dto: DistrictsStatusChangeDto,@Request() req) {
    return this.districtsService.status_change(dto,req["_user_id_"]);
  }
  
  @Post("list")
  list(@Body() dto:DistrictsListDto) {
    return this.districtsService.list(dto);
  }

}
