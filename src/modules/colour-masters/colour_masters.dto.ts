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
const descriptionListSortType = '0-Created Date, 1-Status,2-Name,';
const descriptionType = '0-Solid colour, 1-Gradient colour,';
const descriptionHexCodeSecond =
  'if type=0 then give empty here, otherwise give hex data here';

class ColourCreateList {
  @IsString()
  @ApiProperty({})
  name: string;

  @IsString()
  @ApiProperty({})
  hexCode: string;
  @IsString()
  @ApiProperty({ description: descriptionHexCodeSecond })
  hexCodeSecond: string;

  @IsNumber()
  @ApiProperty({ description: descriptionType })
  type: number;
  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListDataGuard })
  dataGuard: number[];
}

export class ColourCreateDto {
  @IsArray()
  @ApiProperty({ type: [ColourCreateList] })
  @ValidateNested({ each: true })
  @Type(() => ColourCreateList)
  array: ColourCreateList[];
}
export class ColoursEditDto {
  @IsString()
  @ApiProperty({})
  colourId: string;
  @IsString()
  @ApiProperty({})
  name: string;

  @IsString()
  @ApiProperty({})
  hexCode: string;
  @IsString()
  @ApiProperty({ description: descriptionHexCodeSecond })
  hexCodeSecond: string;

  @IsNumber()
  @ApiProperty({ description: descriptionType })
  type: number;
  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListDataGuard })
  dataGuard: number[];
}

export class ColoursListDto {
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
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number], description: descriptionType })
  types: number[];
  @IsArray()
  @ApiProperty({ type: [String] })
  colourIds: string[];
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

export class ColoursStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  colourIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}

export class ColoursCheckNameExistDto {
  @IsString()
  @ApiProperty({})
  value: string;

  @IsArray()
  @ApiProperty({ type: [String] })
  existingIds: string[];
}
