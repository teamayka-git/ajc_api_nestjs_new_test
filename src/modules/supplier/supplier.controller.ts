import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/Auth/roles.guard';
import { SupplierService } from './supplier.service';
import { Response } from 'express'; //jwt response store in cookie
import { Roles } from 'src/Auth/roles.decorator';
import { GuardUserRole, GuardUserRoleStringGenerate } from 'src/common/GuardUserRole';
import { SupplierLoginDto } from './supplier.dto';

@Controller('supplier')
@UseGuards(RolesGuard)
@ApiTags("Supplier Docs") 
export class SupplierController {
  constructor( private jwtService: JwtService,private readonly supplierService: SupplierService) {}

  @Post("login")
  @Roles(GuardUserRole.SUPPLIER)
  async login(@Body() dto: SupplierLoginDto,
    @Res({ passthrough: true }) response: Response, //jwt response store in cookie
  ) {
    var returnData: Object = await this.supplierService.login(dto);
    
var userRole=new GuardUserRoleStringGenerate().generate(returnData['_userRole']);






    const jwt = await this.jwtService.signAsync(
      {
        _userId_: returnData['_id'],
        _supplierId_: returnData['_supplierId'],
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
