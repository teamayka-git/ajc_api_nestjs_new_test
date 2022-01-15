import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { Request, Response } from "express";
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) { }

  async use(req: Request, res: Response, next: () => void) {
    console.log("request happening, message from middlewate" + req.url);

      //  console.log("body  "+JSON.stringify(req.body));


    var jwt_token;

    if (req.headers.hasOwnProperty("authorization")) {
      jwt_token = req.headers.authorization;
    } else {
      jwt_token = req.cookies[process.env.JWT_CLIENT_COOKIE_KEY];//jwt read cookie
      
    }
    
    try {


      const data = await this.jwtService.verifyAsync(jwt_token);


      if (!data) {
        throw new UnauthorizedException();

      }

      req["_userId_"] = data._userId_;
      req["_employeeId_"] = data._employeeId_;

     
      next();
      //return jwt_token;
    } catch (e) {
      throw new UnauthorizedException();
    }



// req["_user_id_"] = "fsd87fsd78f87sd";
     
    // next();

  }



}