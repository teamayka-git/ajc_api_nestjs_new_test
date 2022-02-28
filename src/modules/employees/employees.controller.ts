import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseGuards, UseInterceptors, UploadedFiles, Request, Put } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { JwtService } from '@nestjs/jwt';
import { CheckEmailExistDto, CheckMobileExistDto, EmployeeCreateDto, EmployeeEditDto, EmployeeListDto, EmployeeLoginDto, EmployeeStatusChangeDto } from './employees.dto';
import { Response } from 'express'; //jwt response store in cookie
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { GuardUserRole, GuardUserRoleStringGenerate } from 'src/common/GuardUserRole';
import { RolesGuard } from 'src/Auth/roles.guard';
import { Roles } from 'src/Auth/roles.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FileMulterHelper } from 'src/shared/file_multter_helper';
import { diskStorage } from 'multer';
import { AgentListDto, AgentStatusChangeDto } from '../agent/agent.dto';

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

  

  @Post()
  @Roles(GuardUserRole.SUPER_ADMIN)
  @ApiCreatedResponse({ description: 'files upload on these input feilds => [image]' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'image',
        },
      ],
      {
        storage: diskStorage({
          destination: FileMulterHelper.filePathTempEmployee,
          filename: FileMulterHelper.customFileName,
        }),
      },
    ),
  )
  create(@Body() dto: EmployeeCreateDto,@Request() req, @UploadedFiles() file) {
    return this.employeesService.create(dto,req["_userId_"],file == null ? {} : JSON.parse(JSON.stringify(file)));
  }
  
  @Put()
  @Roles(GuardUserRole.SUPER_ADMIN)
  @ApiCreatedResponse({ description: 'files upload on these input feilds => [image]' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'image',
        },
      ],
      {
        storage: diskStorage({
          destination: FileMulterHelper.filePathTempAgent,
          filename: FileMulterHelper.customFileName,
        }),
      },
    ),
  )
  edit(@Body() dto: EmployeeEditDto,@Request() req, @UploadedFiles() file) {
    return this.employeesService.edit(dto,req["_userId_"],file == null ? {} : JSON.parse(JSON.stringify(file)));
  }
  @Delete()
  @Roles(GuardUserRole.SUPER_ADMIN)
  status_change(@Body() dto: EmployeeStatusChangeDto,@Request() req) {
    return this.employeesService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:EmployeeListDto) {
    return this.employeesService.list(dto);
  }

  @Post("checkEmailExisting")
  checkEmailExisting(@Body() dto:CheckEmailExistDto) {
    return this.employeesService.checkEmailExisting(dto);
  }
  
 
  @Post("checkMobileExisting")
  checkMobileExisting(@Body() dto:CheckMobileExistDto) {
    return this.employeesService.checkMobileExisting(dto);
  }
  
}
