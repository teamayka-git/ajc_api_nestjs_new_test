import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { BanksCreateDto, BanksEditDto, BanksListDto, BanksStatusChangeDto } from './banks.dto';
import { BanksService } from './banks.service';


@UseGuards(RolesGuard)
@ApiTags("Bank Docs") 
@Controller('banks')
export class BanksController {
  constructor(private readonly banksService: BanksService) {}


  

  @Post()
  @Roles(GuardUserRole.SUPER_ADMIN)
  create(@Body() dto: BanksCreateDto,@Request() req) {
    return this.banksService.create(dto,req["_userId_"]);
  }
  
  @Put()
  @Roles(GuardUserRole.SUPER_ADMIN)
  edit(@Body() dto: BanksEditDto,@Request() req) {
    return this.banksService.edit(dto,req["_userId_"]);
  }
  @Delete()
  @Roles(GuardUserRole.SUPER_ADMIN)
  status_change(@Body() dto: BanksStatusChangeDto,@Request() req) {
    return this.banksService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:BanksListDto) {
    return this.banksService.list(dto);
  }


}
