import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { TransportMastersService } from './transport-masters.service';
import { CheckNameExistDto, TransportMastersCreateDto, TransportMastersEditDto, TransportMastersListDto, TransportMastersStatusChangeDto } from './transportMasters.dto';

@UseGuards(RolesGuard)
@ApiTags("Transport masters Docs") 
@Controller('transport-masters')
export class TransportMastersController {
  constructor(private readonly transportMastersService: TransportMastersService) {}


  @Post()
   
  create(@Body() dto: TransportMastersCreateDto,@Request() req) {
    return this.transportMastersService.create(dto,req["_userId_"]);
  }
  
  @Put()
   
  edit(@Body() dto: TransportMastersEditDto,@Request() req) {
    return this.transportMastersService.edit(dto,req["_userId_"]);
  }
  @Delete()
   
  status_change(@Body() dto: TransportMastersStatusChangeDto,@Request() req) {
    return this.transportMastersService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:TransportMastersListDto) {
    return this.transportMastersService.list(dto);
  }

  @Post("checkNameExisting")
  checkNameExisting(@Body() dto:CheckNameExistDto) {
    return this.transportMastersService.checkNameExisting(dto);
  }
  

}
