import {
  Body,
  Controller,
  Delete,
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
import { SupplierService } from './supplier.service';
import { Response } from 'express'; //jwt response store in cookie
import { Roles } from 'src/Auth/roles.decorator';
import {
  GuardUserRole,
  GuardUserRoleStringGenerate,
} from 'src/common/GuardUserRole';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FileMulterHelper } from 'src/shared/file_multter_helper';
import { diskStorage } from 'multer';
import {
  CheckEmailExistDto,
  CheckMobileExistDto,
  ListFilterLocadingSupplierDto,
  SupplierCreateDto,
  SupplierEditDto,
  SupplierListDto,
  SupplierLoginDto,
  SupplierStatusChangeDto,
} from './supplier.dto';

@Controller('supplier')
@UseGuards(RolesGuard)
@ApiTags('Supplier Docs')
export class SupplierController {
  constructor(
    private jwtService: JwtService,
    private readonly supplierService: SupplierService,
  ) {}

  @Post('login')
  async login(
    @Body() dto: SupplierLoginDto,
    @Res({ passthrough: true }) response: Response, //jwt response store in cookie
  ) {
    var returnData: Object = await this.supplierService.login(dto);

    var userRole = new GuardUserRoleStringGenerate().generate(
      returnData['_userType'],
    );

    const jwt = await this.jwtService.signAsync(
      {
        _userId_: returnData['_id'],
        _supplierId_: returnData['_supplierId'],
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
          destination: FileMulterHelper.filePathTempSupplier,
          filename: FileMulterHelper.customFileName,
        }),
      },*/
    ),
  )
  create(
    @Body() dto: SupplierCreateDto,
    @Request() req,
    @UploadedFiles() file,
  ) {
    return this.supplierService.create(
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
          destination: FileMulterHelper.filePathTempSupplier,
          filename: FileMulterHelper.customFileName,
        }),
      },*/
    ),
  )
  edit(@Body() dto: SupplierEditDto, @Request() req, @UploadedFiles() file) {
    return this.supplierService.edit(
      dto,
      req['_userId_'],
      file == null ? {} : JSON.parse(JSON.stringify(file)),
    );
  }

  @Post('list')
  list(@Body() dto: SupplierListDto) {
    return this.supplierService.list(dto);
  }

  @Post('listFilterLoadingSupplier')
  listFilterLoadingSupplier(@Body() dto: ListFilterLocadingSupplierDto) {
    return this.supplierService.listFilterLoadingSupplier(dto);
  }

  @Post('checkEmailExisting')
  checkEmailExisting(@Body() dto: CheckEmailExistDto) {
    return this.supplierService.checkEmailExisting(dto);
  }

  @Post('checkMobileExisting')
  checkMobileExisting(@Body() dto: CheckMobileExistDto) {
    return this.supplierService.checkMobileExisting(dto);
  }
}
