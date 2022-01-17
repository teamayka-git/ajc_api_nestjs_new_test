import { Body, Controller, Get, Post, Request, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MeDto } from './app.dto';
import { AppService } from './app.service';
import { Roles } from './Auth/roles.decorator';
import { RolesGuard } from './Auth/roles.guard';

@ApiTags("") 
@Controller()
@UseGuards(RolesGuard)
export class AppController {
  constructor(   private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Post("me")
  me(@Body() dto: MeDto, @Request() req) {
    return this.appService.me(dto, req['_userId_']);
  }
  @Post("project_init")
  project_init() {
    return this.appService.project_init();
  }
}
