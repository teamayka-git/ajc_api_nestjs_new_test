import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { CheckEmailExistDto, CheckNameExistDto, CompanyCreateDto, CompanyEditDto, CompanyListDto, CompanyStatusChangeDto } from './company.dto';
import { CompanyService } from './company.service';

@UseGuards(RolesGuard)
@ApiTags("Company Docs") 
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}


  @Post()
   
  create(@Body() dto: CompanyCreateDto,@Request() req) {
    return this.companyService.create(dto,req["_userId_"]);
  }
  
  @Put()
   
  edit(@Body() dto: CompanyEditDto,@Request() req) {
    return this.companyService.edit(dto,req["_userId_"]);
  }
  @Delete()
   
  status_change(@Body() dto: CompanyStatusChangeDto,@Request() req) {
    return this.companyService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:CompanyListDto) {
    return this.companyService.list(dto);
  }

  @Post("checkEmailExisting")
  checkEmailExisting(@Body() dto:CheckEmailExistDto) {
    return this.companyService.checkEmailExisting(dto);
  }
  
  @Post("checkNameExisting")
  checkNameExisting(@Body() dto:CheckNameExistDto) {
    return this.companyService.checkNameExisting(dto);
  }
  

}
