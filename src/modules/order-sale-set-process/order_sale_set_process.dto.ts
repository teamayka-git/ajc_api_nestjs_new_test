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

const DescriptionOrderSaleHistoryType = '1-workStarted, 2-finishedWork';

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
  @IsNumber()
  @ApiProperty({ description: DescriptionOrderSaleHistoryType })
  historyType: number;
}
