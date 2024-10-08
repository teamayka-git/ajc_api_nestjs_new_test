import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector:Reflector){}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {


const roles=this.reflector.get<String>('roles',context.getHandler());
if(!roles){
  return true;
}


const request=context.switchToHttp().getRequest();




for(var i=0;i<roles.length;i++){
  if(request["_userRole_"]==roles[i]){
    return true;
  }
}


    return false;
  }
}
