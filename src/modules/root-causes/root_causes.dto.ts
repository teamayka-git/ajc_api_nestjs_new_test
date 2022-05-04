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
const descriptionListScreenTypeForList = '0-total documents count';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType = '0-Created Date, 1-Status,2-Name';
const descriptionType = '0 - order sale, 1 - halmark, 2 - photography';

class OrderSaleRootCauseCreateList {
  @IsString()
  @ApiProperty({})
  name: string;

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionType })
  type: number[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListDataGuard })
  dataGuard: number[];
}

export class OrderSaleRootCauseCreateDto {
  @IsArray()
  @ApiProperty({ type: [OrderSaleRootCauseCreateList] })
  @ValidateNested({ each: true })
  @Type(() => OrderSaleRootCauseCreateList)
  array: OrderSaleRootCauseCreateList[];
}
export class OrderSaleRootCauseEditDto {
  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionType })
  type: number[];

  @IsString()
  @ApiProperty({})
  orderSaleRootCauseId: string;

  @IsString()
  @ApiProperty({})
  name: string;

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListDataGuard })
  dataGuard: number[];
}

export class OrderSaleRootCauseListDto {
  @IsNumber()
  @ApiProperty({ description: descriptionListSortType })
  sortType: number;
  @IsNumber()
  @ApiProperty({ description: descriptionListSortOrder })
  sortOrder: number;

  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number], description: descriptionStatus })
  statusArray: number[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionListScreenTypeForList,
  })
  screenType: number[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionType })
  types: number[];

  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleRootCauseIds: string[];

  @IsNumber()
  @ApiProperty({})
  limit: number;

  @IsNumber()
  @ApiProperty({})
  skip: number;

  @IsString()
  @ApiProperty({})
  searchingText: string;
}

export class OrderSaleRootCauseStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleRootCauseIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}

export class OrderSaleRootCauseExistDto {
  @IsString()
  @ApiProperty({})
  value: string;

  @IsArray()
  @ApiProperty({ type: [String] })
  existingIds: string[];
}
