import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { CheckItemExistDto, CheckNameExistDto, DistrictsCreateDto, DistrictsEditDto, DistrictsListDto, DistrictsStatusChangeDto, ListFilterLocadingDistrictDto } from './districts.dto';
import { DistrictsService } from './districts.service';


@ApiTags("Districts Docs") 
@Controller('districts')
@UseGuards(RolesGuard)
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}

  @Post()
   
  create(@Body() dto: DistrictsCreateDto,@Request() req) {
    return this.districtsService.create(dto,req["_userId_"]);
  }
  
  @Put()
   
  edit(@Body() dto: DistrictsEditDto,@Request() req) {
    return this.districtsService.edit(dto,req["_userId_"]);
  }
  @Delete()
   
  status_change(@Body() dto: DistrictsStatusChangeDto,@Request() req) {
    return this.districtsService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:DistrictsListDto) {
    return this.districtsService.list(dto);
  }
  @Post("listFilterLoadingDistrict")
  listFilterLoadingDistrict(@Body() dto:ListFilterLocadingDistrictDto) {
    return this.districtsService.listFilterLoadingDistrict(dto);
  }
  @Post("checkCodeExisting")
  checkCodeExisting(@Body() dto:CheckItemExistDto) {
    return this.districtsService.checkCodeExisting(dto);
  }
  
  @Post("checkNameExisting")
  checkNameExisting(@Body() dto:CheckNameExistDto) {
    return this.districtsService.checkNameExisting(dto);
  }
  
}
