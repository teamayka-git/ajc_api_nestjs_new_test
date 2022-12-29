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
const descriptionListScreenTypeForList = '0-total documents count, 100-factory details, 101 - factory transfer items, 102 - factory transfer items under[101] group details';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType = '0-Created Date, 1-Status,2-type';
const descriptionGroupType="  0 - non raw material, 1 - raw material";


const descriptionType =
  '  0 - out wards, 1 - in wards';


  class FactoryStockTransferCreateListItem {
    @IsString()
    @ApiProperty({})
    groupId: string;
  
    @IsNumber()
    @ApiProperty({})
    grossWeight: number;
  
    
    @IsNumber()
    @ApiProperty({})
    stoneWeight: number;
  
    @IsNumber()
    @ApiProperty({})
    netWeight: number;
  
    @IsNumber()
    @ApiProperty({})
    purity: number;
  
    @IsNumber()
    @ApiProperty({})
    reminingGrossWeight: number;
  
    @IsNumber()
    @ApiProperty({})
    weight_hundred_percentage: number;
  
    @IsString()
    @ApiProperty({})
    description: string;
    
  }

  class FactoryStockTransferCreateList {
    @IsString()
    @ApiProperty({})
    factoryId: string;
  
    
    
    @IsNumber()
    @ApiProperty({description:descriptionType})
    type: number;
  
    @IsNumber()
    @ApiProperty({description:descriptionGroupType})
    groupType: number;
  
    @IsNumber()
    @ApiProperty({})
    reminingGrossWeight: number;
  
    @IsArray()
    @ApiProperty({ type: [FactoryStockTransferCreateListItem] })
    @ValidateNested({ each: true })
    @Type(() => FactoryStockTransferCreateListItem)
    items: FactoryStockTransferCreateListItem[];
    
  }

export class FactoryStockTransferCreateDto {
  @IsArray()
  @ApiProperty({ type: [FactoryStockTransferCreateList] })
  @ValidateNested({ each: true })
  @Type(() => FactoryStockTransferCreateList)
  array: FactoryStockTransferCreateList[];
}


export class FactoryStockTransferListDto {
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
  @ApiProperty({ type: [Number], })
  responseFormat: number[];
  
  @IsArray()
  @ApiProperty({ type: [String] })
  factoryStockTransferIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  factoryIds: string[];

  

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionType,
  })
  type: number[];


  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionGroupType,
  })
  groupType: number[];


  @IsNumber()
  @ApiProperty({})
  reminingGrossWeightStart: number;

  @IsNumber()
  @ApiProperty({})
  reminingGrossWeightEnd: number;

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

export class FactoryStockTransferStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  factoryStockTransferIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}
