import {
  Body,
  Controller,
  Post,
  Put,
  Request,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/Auth/roles.guard';
import {
  GuardUserRole,
  GuardUserRoleStringGenerate,
} from 'src/common/GuardUserRole';

import { Response } from 'express'; //jwt response store in cookie
import { Roles } from 'src/Auth/roles.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FileMulterHelper } from 'src/shared/file_multter_helper';
import { diskStorage } from 'multer';
import { ShopsService } from './shops.service';
import {
  CheckEmailExistDto,
  CheckMobileExistDto,
  ListShopDto,
  ShopAcrossEmployeesAndCustomersDto,
  ShopAddRemoveCustomerDto,
  ShopAddRemoveUsersDto,
  ShopCreateDto,
  ShopEditeDto,
  ShopFreezStatusChangeDto,
  ShopLoginDto,
  ShopThemeEditDto,
} from './shops.dto';

@UseGuards(RolesGuard)
@ApiTags('Shops Docs')
@Controller('shops')
export class ShopsController {
  constructor(
    private jwtService: JwtService,
    private readonly shopService: ShopsService,
  ) {}

  @Post('login')
  async login(
    @Body() dto: ShopLoginDto,
    @Res({ passthrough: true }) response: Response, //jwt response store in cookie
  ) {
    var returnData: Object = await this.shopService.login(dto);

    var userRole = new GuardUserRoleStringGenerate().generate(
      returnData['_userType'],
    );

    const jwt = await this.jwtService.signAsync(
      {
        _userId_: returnData['_id'],
        _shopId: returnData['_shopId'],
        _type_: returnData['_type'],
        _userRole_: userRole,
      },
      { expiresIn: '365d' },
    );
    //response.cookie(process.env.JWT_CLIENT_COOKIE_KEY, {token:jwt,permissions:returnData["userDetails"]["_permissions"]}, { httpOnly: true });//jwt response store in cookie
    response.cookie(process.env.JWT_CLIENT_COOKIE_KEY, jwt, { httpOnly: true }); //jwt response store in cookie

    return { message: 'Success', data: returnData, token: jwt };
  }

  @Post()
   
  @ApiCreatedResponse({
    description: 'files upload on these input feilds => [image]',
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'image',
        },
      ],
      /*{
        storage: diskStorage({
          destination: FileMulterHelper.filePathTempShop,
          filename: FileMulterHelper.customFileName,
        }),
      },*/
    ),
  )
  create(@Body() dto: ShopCreateDto, @Request() req, @UploadedFiles() file) {
    return this.shopService.create(
      dto,
      req['_userId_'],
      file == null ? {} : JSON.parse(JSON.stringify(file)),
    );
  }

  @Put()
   
  @ApiCreatedResponse({
    description: 'files upload on these input feilds => [image]',
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'image',
        },
      ],
      /*{
        storage: diskStorage({
          destination: FileMulterHelper.filePathTempShop,
          filename: FileMulterHelper.customFileName,
        }),
      },*/
    ),
  )
  edit(@Body() dto: ShopEditeDto, @Request() req, @UploadedFiles() file) {
    return this.shopService.edit(
      dto,
      req['_userId_'],
      file == null ? {} : JSON.parse(JSON.stringify(file)),
    );
  }

  @Post('list')
  list(@Body() dto: ListShopDto) {
    return this.shopService.list(dto);
  }

  @Post('checkEmailExisting')
  checkEmailExisting(@Body() dto: CheckEmailExistDto) {
    return this.shopService.checkEmailExisting(dto);
  }
  @Post('checkEmailUserGet')
  checkEmailUserGet(@Body() dto: CheckEmailExistDto) {
    return this.shopService.checkEmailUserGet(dto);
  }

  @Post('checkMobileExisting')
  checkMobileExisting(@Body() dto: CheckMobileExistDto) {
    return this.shopService.checkMobileExisting(dto);
  }

  @Post('addRemoveUsers')
  addRemoveUsers(@Body() dto: ShopAddRemoveUsersDto, @Request() req) {
    return this.shopService.addRemoveUsers(dto, req['_userId_']);
  }
  @Post('addRemoveCustomers')
  addRemoveCustomers(@Body() dto: ShopAddRemoveCustomerDto, @Request() req) {
    return this.shopService.addRemoveCustomers(dto, req['_userId_']);
  }

  @Post('listCustomersAndEmployeeShopAcross')
  listCustomersAndEmployeeShopAcross(
    @Body() dto: ShopAcrossEmployeesAndCustomersDto,
    @Request() req,
  ) {
    return this.shopService.listCustomersAndEmployeeShopAcross(
      dto,
      req['_userId_'],
    );
  }


  @Post("freezedStatusChange")
  freezedStatusChange(@Body() dto: ShopFreezStatusChangeDto, @Request() req) {
    return this.shopService.freezedStatusChange(dto, req['_userId_']);
  }
  @Post("themeEdit")
  
  @ApiCreatedResponse({
    description: 'files upload on these input feilds => [splashImage,iconImage]',
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'splashImage',
        },
        {
          name: 'iconImage',
        },
      ], 
      /*{
        storage: diskStorage({
          destination: FileMulterHelper.filePathTempShop,
          filename: FileMulterHelper.customFileName,
        }),
      },*/
    ),
  )
  themeEdit(@Body() dto: ShopThemeEditDto, @Request() req, @UploadedFiles() file) {
    return this.shopService.themeEdit(dto, req['_userId_'],
    file == null ? {} : JSON.parse(JSON.stringify(file)));
  }

}
