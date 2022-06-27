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
  '0-total documents count, 100-list calculation items,101-list calculation items advanced';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType = '0-Created Date, 1-Status,2-Name';
const descriptionType = '0-Percentage, 1-Amount';

class FactoryCalculationMasterItemsCreateItemsList {
  @IsString()
  @ApiProperty({})
  subCategoryId: string;

  @IsNumber()
  @ApiProperty({})
  percentage: number;
}

class FactoryCalculationMasterItemsEditItemsList {
  @IsString()
  @ApiProperty({})
  factoryCalculationItemId: string;
  
  @IsString()
  @ApiProperty({})
  subCategoryId: string;


  @IsNumber()
  @ApiProperty({})
  percentage: number;
}

class FactoriesCalculationMasterCreateList {
  @IsString()
  @ApiProperty({})
  name: string;

  @IsArray()
  @ApiProperty({ type: [FactoryCalculationMasterItemsCreateItemsList] })
  @ValidateNested({ each: true })
  @Type(() => FactoryCalculationMasterItemsCreateItemsList)
  arrayItems: FactoryCalculationMasterItemsCreateItemsList[];
}

export class FactoriesCalculationMasterCreateDto {
  @IsArray()
  @ApiProperty({ type: [FactoriesCalculationMasterCreateList] })
  @ValidateNested({ each: true })
  @Type(() => FactoriesCalculationMasterCreateList)
  array: FactoriesCalculationMasterCreateList[];
}
export class FactoryCalculationMasterEditDto {
  @IsString()
  @ApiProperty({})
  calculationMasterId: string;

  @IsString()
  @ApiProperty({})
  name: string;

  @IsArray()
  @ApiProperty({ type: [FactoryCalculationMasterItemsCreateItemsList] })
  @ValidateNested({ each: true })
  @Type(() => FactoryCalculationMasterItemsCreateItemsList)
  newItems: FactoryCalculationMasterItemsCreateItemsList[];

  
  @IsArray()
  @ApiProperty({ type: [FactoryCalculationMasterItemsEditItemsList] })
  @ValidateNested({ each: true })
  @Type(() => FactoryCalculationMasterItemsEditItemsList)
  arrayUpdate: FactoryCalculationMasterItemsEditItemsList[];

  
  
}

export class FactoryCalculationMasterListDto {
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
  calculationMasterIds: string[];

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

export class FactoryCalculationMasterStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  calculationMasterIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}
