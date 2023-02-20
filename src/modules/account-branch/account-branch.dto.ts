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
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType = '0-Created Date, 1-Status, 2-Name, 3-Code';

class AccountBranchCreateList {
  @IsString()
  @ApiProperty({})
  code: string;

  @IsString()
  @ApiProperty({})
  name: string;

}

export class AccountBranchCreateDto {
  @IsArray()
  @ApiProperty({ type: [AccountBranchCreateList] })
  @ValidateNested({ each: true })
  @Type(() => AccountBranchCreateList)
  array: AccountBranchCreateList[];
}

export class AccountBranchEditDto {
  @IsString()
  @ApiProperty({})
  AccountBranchId: string;

  @IsString()
  @ApiProperty({})
  code: string;

  @IsString()
  @ApiProperty({})
  name: string;

}

export class AccountBranchStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  AccountBranchIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}

export class AccountBranchListDto {
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
  AccountBranchIds: string[];

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

export class CheckNameExistDto {
  @IsString()
  @ApiProperty({})
  value: string;

  @IsArray()
  @ApiProperty({ type: [String] })
  existingIds: string[];
}