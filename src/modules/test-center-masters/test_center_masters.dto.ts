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
const descriptionListScreenTypeForList = '0-total documents count, 100-test center user data populate, 101-city details, 102-district and state details only if city details exist';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';

const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType =
  '0-Created Date, 1-Status,2-Name, 3-Code, 4-Allowed wastage';

class TestCenterMastersCreateList {
  @IsString()
  @ApiProperty({})
  name: string;

  @IsString()
  @ApiProperty({})
  email: string;

  @IsString()
  @ApiProperty({})
  mobile: string;

  @IsString()
  @ApiProperty({})
  address: string;

  @IsString()
  @ApiProperty({})
  cityId: string;

  @IsNumber()
  @ApiProperty({})
  code: number;

  @IsNumber()
  @ApiProperty({})
  allowedWastage: number;

  @IsNumber()
  @ApiProperty({})
  isTaxIgstEnabled: number;

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListDataGuard })
  dataGuard: number[];
}

export class TestCenterMastersCreateDto {
  @IsArray()
  @ApiProperty({ type: [TestCenterMastersCreateList] })
  @ValidateNested({ each: true })
  @Type(() => TestCenterMastersCreateList)
  array: TestCenterMastersCreateList[];
}
export class TestCenterMastersEditDto {
  @IsString()
  @ApiProperty({})
  testCenterMasterId: string;

  @IsString()
  @ApiProperty({})
  name: string;
  @IsString()
  @ApiProperty({})
  address: string;

  @IsString()
  @ApiProperty({})
  cityId: string;

  @IsString()
  @ApiProperty({})
  mobile: string;



  @IsNumber()
  @ApiProperty({})
  code: number;

  @IsNumber()
  @ApiProperty({})
  allowedWastage: number;
  
  @IsNumber()
  @ApiProperty({})
  isTaxIgstEnabled: number;
  
  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListDataGuard })
  dataGuard: number[];
}

export class TestCenterMastersListDto {
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
  testCenterMastersIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  cityIds: string[];

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

export class TestCenterMastersStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  testCenterMastersIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}
export class CheckItemExistDto {
  @IsString()
  @ApiProperty({})
  value: string;

  @IsArray()
  @ApiProperty({ type: [String] })
  existingIds: string[];
}
export class CheckNameExistDto {
  @IsString()
  @ApiProperty({})
  value: string;

  @IsArray()
  @ApiProperty({ type: [String] })
  existingIds: string[];
}
