import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseGuards } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { JwtService } from '@nestjs/jwt';
import { EmployeeLoginDto } from './employees.dto';
import { Response } from 'express'; //jwt response store in cookie
import { ApiTags } from '@nestjs/swagger';
import { GuardUserRole, GuardUserRoleStringGenerate } from 'src/common/GuardUserRole';
import { RolesGuard } from 'src/Auth/roles.guard';
import { Roles } from 'src/Auth/roles.decorator';

@ApiTags('Employee Docs')
@UseGuards(RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(
    private jwtService: JwtService,private readonly employeesService: EmployeesService) {}


  @Post("login")
  async login(@Body() dto: EmployeeLoginDto,
    @Res({ passthrough: true }) response: Response, //jwt response store in cookie
  ) {
    var returnData: Object = await this.employeesService.login(dto);
    
var userRole=new GuardUserRoleStringGenerate().generate(returnData['_userRole']);






    const jwt = await this.jwtService.signAsync(
      {
        _userId_: returnData['_id'],
        _employeeId_: returnData['_employeeId'],
        _type_: returnData['_type'],
        _userRole_:userRole
      },
      { expiresIn: '365d' },
    );
    //response.cookie(process.env.JWT_CLIENT_COOKIE_KEY, {token:jwt,permissions:returnData["userDetails"]["_permissions"]}, { httpOnly: true });//jwt response store in cookie
    response.cookie(process.env.JWT_CLIENT_COOKIE_KEY, jwt, { httpOnly: true }); //jwt response store in cookie

    return { message: 'Success', data: returnData, token: jwt };
  }

  
}
