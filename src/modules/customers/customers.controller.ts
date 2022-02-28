import { Body, Controller, Post, Put, Request, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole, GuardUserRoleStringGenerate } from 'src/common/GuardUserRole';
import { CheckEmailExistDto, CheckMobileExistDto, CustomerCreateDto, CustomerEditeDto, CustomerLoginDto, ListCustomersDto } from './customers.dto';
import { CustomersService } from './customers.service';
import { Response } from 'express'; //jwt response store in cookie
import { Roles } from 'src/Auth/roles.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FileMulterHelper } from 'src/shared/file_multter_helper';
import { diskStorage } from 'multer';

@UseGuards(RolesGuard)
@ApiTags("Customers Docs") 
@Controller('customers')
export class CustomersController {
  constructor(private jwtService: JwtService,private readonly customersService: CustomersService) {}


  @Post("login")
  async login(@Body() dto: CustomerLoginDto,
    @Res({ passthrough: true }) response: Response, //jwt response store in cookie
  ) {
    var returnData: Object = await this.customersService.login(dto);
    
var userRole=new GuardUserRoleStringGenerate().generate(returnData['_userRole']);






    const jwt = await this.jwtService.signAsync(
      {
        _userId_: returnData['_id'],
        _customerId: returnData['_customerId'],
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
          destination: FileMulterHelper.filePathTempCustomer,
          filename: FileMulterHelper.customFileName,
        }),
      },
    ),
  )
  create(@Body() dto: CustomerCreateDto,@Request() req, @UploadedFiles() file) {
    return this.customersService.create(dto,req["_userId_"],file == null ? {} : JSON.parse(JSON.stringify(file)));
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
          destination: FileMulterHelper.filePathTempCustomer,
          filename: FileMulterHelper.customFileName,
        }),
      },
    ),
  )
  edit(@Body() dto: CustomerEditeDto,@Request() req, @UploadedFiles() file) {
    return this.customersService.edit(dto,req["_userId_"],file == null ? {} : JSON.parse(JSON.stringify(file)));
  }



  @Post("list")
  list(@Body() dto:ListCustomersDto) {
    return this.customersService.list(dto);
  }

  @Post("checkEmailExisting")
  checkEmailExisting(@Body() dto:CheckEmailExistDto) {
    return this.customersService.checkEmailExisting(dto);
  }
  
 
  @Post("checkMobileExisting")
  checkMobileExisting(@Body() dto:CheckMobileExistDto) {
    return this.customersService.checkMobileExisting(dto);
  }
  

}
