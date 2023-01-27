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
const descriptionUnder = 'Under Account Sub Group';
const descriptionListSortType = '0-Created Date, 1-Status, 2-Name, 3-Code';

class AccountLedgerCreateList {
  @IsString()
  @ApiProperty({})
  code: string;

  @IsString()
  @ApiProperty({})
  name: string;

  @IsString()
  @ApiProperty({type: String, description: descriptionUnder })
  underId: String;

  @IsString()
  @ApiProperty({})
  address: String;

  @IsString()
  @ApiProperty({})
  phone: String;

  @IsString()
  @ApiProperty({})
  email: String;

  @IsString()
  @ApiProperty({})
  city: String;

  @IsString()
  @ApiProperty({})
  state: String;

  @IsString()
  @ApiProperty({})
  country: String;

  @IsString()
  @ApiProperty({})
  pin: String;

  @IsString()
  @ApiProperty({})
  remarks: String;

}

export class AccountLedgerCreateDto {
  @IsArray()
  @ApiProperty({ type: [AccountLedgerCreateList] })
  @ValidateNested({ each: true })
  @Type(() => AccountLedgerCreateList)
  array: AccountLedgerCreateList[];
}

export class AccountLedgerEditDto {
  @IsString()
  @ApiProperty({})
  AccountLedgerId: string;

  @IsString()
  @ApiProperty({})
  code: string;

  @IsString()
  @ApiProperty({})
  name: string;

  @IsString()
  @ApiProperty({type: String, description: descriptionUnder })
  underId: string;

  @IsString()
  @ApiProperty({})
  address: String;

  @IsString()
  @ApiProperty({})
  phone: String;

  @IsString()
  @ApiProperty({})
  email: String;

  @IsString()
  @ApiProperty({})
  city: String;

  @IsString()
  @ApiProperty({})
  state: String;

  @IsString()
  @ApiProperty({})
  country: String;

  @IsString()
  @ApiProperty({})
  pin: String;

  @IsString()
  @ApiProperty({})
  remarks: String;

}

export class AccountLedgerStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  AccountLedgerIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}

export class AccountLedgerListDto {
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
  AccountLedgerIds: string[];

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