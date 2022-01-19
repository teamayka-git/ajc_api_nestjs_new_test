import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole, GuardUserRoleStringGenerate } from 'src/common/GuardUserRole';
import { AgentLoginDto } from './agent.dto';
import { AgentService } from './agent.service';

import { Response } from 'express'; //jwt response store in cookie
@Controller('agent')
@UseGuards(RolesGuard)
@ApiTags("Agent Docs") 
export class AgentController {
  constructor( private jwtService: JwtService,private readonly agentService: AgentService) {}

  @Post("login")
  @Roles(GuardUserRole.AGENT)
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


}
