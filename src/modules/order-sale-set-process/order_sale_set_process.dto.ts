import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNumber,
  isNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type, Type as ValidateTypes } from 'class-transformer';
import { Optional } from '@nestjs/common';

const descriptionStatus = '0-Inactive, 1-Active, 2-Delete';

const DescriptionOrderSaleChangeProcessOrderStatus =
  '0-Pending, 1-Assigned, 2-On Working, 3-Completed, 4-Hold,5 -  Request To Assign, 6 - reject, 7 - takeback';
const DescriptionAddSubProcessHistory =
  '0-no need to add any history for sub process, 1-add subprocess history like started finished like';

  const descriptionListDocType = '0-image, 1-video, 2-pdf, 3-audio, 4-document';
  const descriptionFileOriginalName =
  "file name givent while uploading, if there is no image then give 'nil; here";

const DescriptionSetProcessHistoryType =
  '/order-sale-set-process/setProcessHistories';
const DescriptionOrderSaleSetProcessHistories =
  ' 0 - created  process, 1 - process work assigned, 2 - process work started, 3 - finished process work, 4 - process work on holding, 5 - process work on reassign request, 6 - process description editted, 7 - rejected by employee, 8-rejected';
const DescriptionOrderSaleSetSubProcessHistories =
  ' 0 - created all sub processed, 1 - process work started, 2 - finished sub process, 3 - finished process work';
class processCreateList {
  @IsString()
  @ApiProperty({})
  processId: string;

  @IsString()
  @ApiProperty({})
  description: string;
  
  @IsNumber()
  @ApiProperty({})
  index: string;

  @IsNumber()
  @ApiProperty({})
  dueDate: string;
}
class SetProcessCreateList {
  @IsString()
  @ApiProperty({})
  orderSaleId: string;

  @IsArray()
  @ApiProperty({ type: [processCreateList] })
  arrayProcess: processCreateList[];
}

export class SetProcessCreateDto {
  @IsArray()
  @ApiProperty({ type: [SetProcessCreateList] })
  @ValidateNested({ each: true })
  @Type(() => SetProcessCreateList)
  array: SetProcessCreateList[];
}
class SetProcessNotesDocumentList {
  @IsString()
  @ApiProperty({ description: descriptionFileOriginalName })
  fileOriginalName: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionListDocType })
  docType: number;
}
export class ChangeProcessOrderStatusDto {
  @IsString()
  @ApiProperty({})
  orderSaleSetProcessId: string;

  @IsString()
  @ApiProperty({})
  userId: string;

  @IsString()
  @ApiProperty({})
  description: string;

  @IsString()
  @ApiProperty({})
  processNote: string;

  @IsString()
  @ApiProperty({})
  descriptionSetProcessHistory: string;

  @IsString()
  @ApiProperty({})
  rootCauseId: string;

  @IsString()
  @ApiProperty({})
  rootCause: string;

  
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: DescriptionOrderSaleChangeProcessOrderStatus })
  orderStatus: number;

  
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({  })
  isLastSetProcess: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: DescriptionSetProcessHistoryType })
  setProcessHistoryType: number;

  
  @IsOptional()
  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [SetProcessNotesDocumentList] })
  @ValidateNested({ each: true })
  @Type(() => SetProcessNotesDocumentList)
  arrayDocuments: SetProcessNotesDocumentList[];

}
export class ChangeProcessDescriptionOrderStatusDto {
  @IsString()
  @ApiProperty({})
  orderSaleSetProcessId: string;

  @IsString()
  @ApiProperty({})
  description: string;
}
export class ChangeSubProcessOrderStatusDto {
  @IsString()
  @ApiProperty({})
  orderSaleSetSubProcessId: string;

  @IsString()
  @ApiProperty({})
  userId: string;

  @IsString()
  @ApiProperty({})
  description: string;

  @IsNumber()
  @ApiProperty({ description: DescriptionOrderSaleChangeProcessOrderStatus })
  orderStatus: number;
}

export class SetProcessHistoryListDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  userIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  processIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  createdUserIds: string[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: DescriptionOrderSaleSetProcessHistories,
  })
  types: number[];

  @IsArray()
  @ApiProperty({
    type: [Number],
  })
  statusArray: number[];
}

export class SetSubProcessHistoryListDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleSetProcessIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  userIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  subProcessIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  createdUserIds: string[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: DescriptionOrderSaleSetSubProcessHistories,
  })
  types: number[];

  @IsArray()
  @ApiProperty({
    type: [Number],
  })
  statusArray: number[];
}
export class SetProcessTakebackDto {
  
  @IsString()
  @ApiProperty({})
  orderSaleSetProcessId: string;

  
}
