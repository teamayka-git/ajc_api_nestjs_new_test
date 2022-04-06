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
const descriptionListScreenTypeForList =
  '0-total documents count,100-customer, 101-orderDetails, 102-subCategoryDetails, 103-CategoryDetails, 104-groupDetails';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType =
  '0-Created Date, 1-Status,2-Name, 3-uuid, 4-grossWeight, 5-type, 6-purity, 7-designerId, 8-hmSealing, 9-huid, 10-eCommerceStatus';
const descriptionType = '0-order sale, 1-Stock sale';

class StonesList {
  @IsString()
  @ApiProperty({})
  stoneId: string;

  @IsNumber()
  @ApiProperty({})
  stoneWeight: number;

  @IsNumber()
  @ApiProperty({})
  quantity: number;
}

class ProductCreateList {
  @IsString()
  @ApiProperty({})
  name: string;

  @IsString()
  @ApiProperty({})
  customerId: string;

  @IsString()
  @ApiProperty({})
  subCategoryCode: string;

  @IsString()
  @ApiProperty({})
  orderId: string;

  @IsString()
  @ApiProperty({})
  categoryId: string;

  @IsString()
  @ApiProperty({})
  groupId: string;

  @IsNumber()
  @ApiProperty({})
  grossWeight: number;

  @IsNumber()
  @ApiProperty({})
  hmSealingStatus: number;

  @IsNumber()
  @ApiProperty({})
  eCommerceStatus: number;

  @IsNumber()
  @ApiProperty({ description: descriptionType })
  type: number;

  @IsNumber()
  @ApiProperty({ description: descriptionType })
  purity: number;

  @IsString()
  @ApiProperty({})
  subCategoryId: string;

  @IsArray()
  @ApiProperty({ type: [StonesList] })
  @ValidateNested({ each: true })
  @Type(() => StonesList)
  stonesArray: StonesList[];
}

export class CitiesCreateDto {
  @IsArray()
  @ApiProperty({ type: [ProductCreateList] })
  @ValidateNested({ each: true })
  @Type(() => ProductCreateList)
  productArray: ProductCreateList[];
}

export class CitiesListDto {
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
  @ApiProperty({ type: [String] })
  citiesIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  districtIds: string[];

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
