import { Body, Controller, Delete, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { TestCenterMastersService } from './test-center-masters.service';
import { CheckItemExistDto, CheckNameExistDto, TestCenterMastersCreateDto, TestCenterMastersEditDto, TestCenterMastersListDto, TestCenterMastersStatusChangeDto } from './test_center_masters.dto';

@UseGuards(RolesGuard)
@ApiTags("Test Center Docs") 
@Controller('test-center-masters')
export class TestCenterMastersController {
  constructor(private readonly testCenterMastersService: TestCenterMastersService) {}


  @Post()
  @Roles(GuardUserRole.SUPER_ADMIN)
  create(@Body() dto: TestCenterMastersCreateDto,@Request() req) {
    return this.testCenterMastersService.create(dto,req["_userId_"]);
  }
  
  @Put()
  @Roles(GuardUserRole.SUPER_ADMIN)
  edit(@Body() dto: TestCenterMastersEditDto,@Request() req) {
    return this.testCenterMastersService.edit(dto,req["_userId_"]);
  }
  @Delete()
  @Roles(GuardUserRole.SUPER_ADMIN)
  status_change(@Body() dto: TestCenterMastersStatusChangeDto,@Request() req) {
    return this.testCenterMastersService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:TestCenterMastersListDto) {
    return this.testCenterMastersService.list(dto);
  }
  @Post("checkCodeExisting")
  checkCodeExisting(@Body() dto:CheckItemExistDto) {
    return this.testCenterMastersService.checkCodeExisting(dto);
  }
  
  @Post("checkNameExisting")
  checkNameExisting(@Body() dto:CheckNameExistDto) {
    return this.testCenterMastersService.checkNameExisting(dto);
  }
  

}
