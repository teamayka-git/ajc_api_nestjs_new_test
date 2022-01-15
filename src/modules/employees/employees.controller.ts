import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { JwtService } from '@nestjs/jwt';
import { EmployeeLoginDto } from './employees.dto';
import { Response } from 'express'; //jwt response store in cookie
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Employee Docs')
@Controller('employees')
export class EmployeesController {
  constructor(
    private jwtService: JwtService,private readonly employeesService: EmployeesService) {}


  @Post("login")
  async login(@Body() dto: EmployeeLoginDto,
    @Res({ passthrough: true }) response: Response, //jwt response store in cookie
  ) {
    var returnData: Object = await this.employeesService.login(dto);

    const jwt = await this.jwtService.signAsync(
      {
        _userId_: returnData['_id'],
        _employeeId_: returnData['_employeeId'],
        _type_: returnData['_type'],
      },
      { expiresIn: '365d' },
    );
    //response.cookie(process.env.JWT_CLIENT_COOKIE_KEY, {token:jwt,permissions:returnData["userDetails"]["_permissions"]}, { httpOnly: true });//jwt response store in cookie
    response.cookie(process.env.JWT_CLIENT_COOKIE_KEY, jwt, { httpOnly: true }); //jwt response store in cookie

    return { message: 'Success', data: returnData, token: jwt };
  }

  
}
