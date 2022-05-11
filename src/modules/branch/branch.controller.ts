import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Put,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/roles.decorator';
import { RolesGuard } from 'src/Auth/roles.guard';
import { GuardUserRole } from 'src/common/GuardUserRole';
import { FileMulterHelper } from 'src/shared/file_multter_helper';
import {
  BranchCreateDto,
  BranchEditDto,
  BranchListDto,
  BranchStatusChangeDto,
  CheckEmailExistDto,
} from './branch.dto';
import { BranchService } from './branch.service';
import { diskStorage } from 'multer';

@ApiTags('Branch Docs')
@Controller('branch')
@UseGuards(RolesGuard)
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @Roles(GuardUserRole.SUPER_ADMIN)
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
          destination: FileMulterHelper.filePathTempBranch,
          filename: FileMulterHelper.customFileName,
        }),
      },*/
    ),
  )
  create(@Body() dto: BranchCreateDto, @Request() req, @UploadedFiles() file) {
    return this.branchService.create(
      dto,
      file == null ? {} : JSON.parse(JSON.stringify(file)),
    );
  }

  @Put()
  @Roles(GuardUserRole.SUPER_ADMIN)
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
          destination: FileMulterHelper.filePathTempBranch,
          filename: FileMulterHelper.customFileName,
        }),
      },*/
    ),
  )
  edit(@Body() dto: BranchEditDto, @Request() req, @UploadedFiles() file) {
    return this.branchService.edit(
      dto,
      req['_userId_'],
      file == null ? {} : JSON.parse(JSON.stringify(file)),
    );
  }
  @Delete()
  @Roles(GuardUserRole.SUPER_ADMIN)
  status_change(@Body() dto: BranchStatusChangeDto, @Request() req) {
    return this.branchService.status_change(dto, req['_userId_']);
  }

  @Post('list')
  list(@Body() dto: BranchListDto) {
    return this.branchService.list(dto);
  }

  @Post('checkEmailExisting')
  checkEmailExisting(@Body() dto: CheckEmailExistDto) {
    return this.branchService.checkEmailExisting(dto);
  }
}
