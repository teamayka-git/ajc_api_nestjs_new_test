import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { CheckItemExistDto, CheckNameExistDto, StatesCreateDto, StatesEditDto, StatesListDto, StatesStatusChangeDto } from './states.dto';
import { StatesService } from './states.service';






@Controller('states')
@UseGuards(RolesGuard)
@ApiTags("State Docs") 
export class StatesController {
  constructor(private readonly statesService: StatesService) {}

  @Post()
  @Roles(GuardUserRole.SUPER_ADMIN)
  create(@Body() dto: StatesCreateDto,@Request() req) {
    return this.statesService.create(dto,req["_userId_"]);
  }
  
  @Put()
  @Roles(GuardUserRole.SUPER_ADMIN)
  edit(@Body() dto: StatesEditDto,@Request() req) {
    return this.statesService.edit(dto,req["_userId_"]);
  }
  @Delete()
  @Roles(GuardUserRole.SUPER_ADMIN)
  status_change(@Body() dto: StatesStatusChangeDto,@Request() req) {
    return this.statesService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:StatesListDto) {
    return this.statesService.list(dto);
  }
  @Post("checkCodeExisting")
  checkCodeExisting(@Body() dto:CheckItemExistDto) {
    return this.statesService.checkCodeExisting(dto);
  }
  
  @Post("checkNameExisting")
  checkNameExisting(@Body() dto:CheckNameExistDto) {
    return this.statesService.checkNameExisting(dto);
  }
  


}
