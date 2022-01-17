import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { CitiesCreateDto, CitiesEditDto, CitiesListDto, CitiesStatusChangeDto } from './cities.dto';
import { CitiesService } from './cities.service';



@ApiTags("Cities Docs") 
@Controller('cities')
@UseGuards(RolesGuard)
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  @Roles(GuardUserRole.SUPER_ADMIN)
  create(@Body() dto: CitiesCreateDto,@Request() req) {
    return this.citiesService.create(dto,req["_user_id_"]);
  }
  
  @Put()
  @Roles(GuardUserRole.SUPER_ADMIN)
  edit(@Body() dto: CitiesEditDto,@Request() req) {
    return this.citiesService.edit(dto,req["_user_id_"]);
  }
  @Delete()
  @Roles(GuardUserRole.SUPER_ADMIN)
  status_change(@Body() dto: CitiesStatusChangeDto,@Request() req) {
    return this.citiesService.status_change(dto,req["_user_id_"]);
  }
  
  @Post("list")
  list(@Body() dto:CitiesListDto) {
    return this.citiesService.list(dto);
  }

}
