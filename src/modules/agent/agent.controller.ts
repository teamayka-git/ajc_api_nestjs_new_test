import { Body, Controller, Delete, Post, Put, Request, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole, GuardUserRoleStringGenerate } from 'src/common/GuardUserRole';
import {  AgentCreateDto, AgentEditDto, AgentListDto, AgentLoginDto, AgentStatusChangeDto, CheckEmailExistDto, CheckMobileExistDto, ListFilterLocadingAgentDto } from './agent.dto';
import { AgentService } from './agent.service';

import { Response } from 'express'; //jwt response store in cookie
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FileMulterHelper } from 'src/shared/file_multter_helper';
import { diskStorage } from 'multer';
@Controller('agent')
@UseGuards(RolesGuard)
@ApiTags("Agent Docs") 
export class AgentController {
  constructor( private jwtService: JwtService,private readonly agentService: AgentService) {}

  @Post("login")
  async login(@Body() dto: AgentLoginDto,
    @Res({ passthrough: true }) response: Response, //jwt response store in cookie
  ) {
    var returnData: Object = await this.agentService.login(dto);
    
var userRole=new GuardUserRoleStringGenerate().generate(returnData['_userRole']);






    const jwt = await this.jwtService.signAsync(
      {
        _userId_: returnData['_id'],
        _agentId_: returnData['_agentId'],
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
          destination: FileMulterHelper.filePathTempAgent,
          filename: FileMulterHelper.customFileName,
        }),
      },
    ),
  )
  create(@Body() dto: AgentCreateDto,@Request() req, @UploadedFiles() file) {
    return this.agentService.create(dto,req["_userId_"],file == null ? {} : JSON.parse(JSON.stringify(file)));
  }
  
  @Put()
  
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
  edit(@Body() dto: AgentEditDto,@Request() req, @UploadedFiles() file) {
    return this.agentService.edit(dto,req["_userId_"],file == null ? {} : JSON.parse(JSON.stringify(file)));
  }
  @Delete()
  status_change(@Body() dto: AgentStatusChangeDto,@Request() req) {
    return this.agentService.status_change(dto,req["_userId_"]);
  }
  
  @Post("list")
  list(@Body() dto:AgentListDto) {
    return this.agentService.list(dto);
  }

  @Post("listFilterLoadingAgent")
  listFilterLoadingAgent(@Body() dto:ListFilterLocadingAgentDto) {
    return this.agentService.listFilterLoadingAgent(dto);
  }

  @Post("checkEmailExisting")
  checkEmailExisting(@Body() dto:CheckEmailExistDto) {
    return this.agentService.checkEmailExisting(dto);
  }
  
  @Post("checkMobileExisting")
  checkMobileExisting(@Body() dto:CheckMobileExistDto) {
    return this.agentService.checkMobileExisting(dto);
  }
  


}
