import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNumber,
  isNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type, Type as ValidateTypes } from 'class-transformer';
import { Optional } from '@nestjs/common';

const descriptionStatus = '0-Inactive, 1-Active, 2-Delete';

const DescriptionOrderSaleChangeProcessOrderStatus =
  '0-Pending, 1-Assigned, 2-On Working, 3-Completed, 4-Hold, Request To Assign';
const DescriptionAddSubProcessHistory =
  '0-no need to add any history for sub process, 1-add subprocess history like started finished like';

const DescriptionSetProcessHistoryType =
  '/order-sale-set-process/setProcessHistories';
const DescriptionOrderSaleSetProcessHistories =
  ' 0 - created  process, 1 - process work assigned, 2 - process work started, 3 - finished process work, 4 - process work on holding, 5 - process work on reassign request, 6 - process description editted';
const DescriptionOrderSaleSetSubProcessHistories =
  ' 0 - created all sub processed, 1 - process work started, 2 - finished sub process, 3 - finished process work';
class processCreateList {
  @IsString()
  @ApiProperty({})
  processId: string;

  @IsString()
  @ApiProperty({})
  description: string;
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

export class ChangeProcessOrderStatusDto {
  @IsString()
  @ApiProperty({})
  orderSaleSetProcessId: string;

  @IsString()
  @ApiProperty({})
  userId: string;

  @IsString()
  @ApiProperty({})
  descriptionId: string;

  @IsNumber()
  @ApiProperty({ description: DescriptionOrderSaleChangeProcessOrderStatus })
  orderStatus: number;

  @IsNumber()
  @ApiProperty({ description: DescriptionSetProcessHistoryType })
  setProcessHistoryType: number;
}
export class ChangeProcessDescriptionOrderStatusDto {
  @IsString()
  @ApiProperty({})
  orderSaleSetProcessId: string;

  @IsString()
  @ApiProperty({})
  descriptionId: string;
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
  descriptionId: string;

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
