import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNumber,
  isNumber,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type, Type as ValidateTypes } from 'class-transformer';
import { Optional } from '@nestjs/common';

const descriptionStatus = '0-Inactive, 1-Active, 2-Delete';
const descriptionListScreenTypeForList =
  '0-total documents count, 100-city details';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';
const descriptionListType =
  ' 0-Employee, 1-Shop, 2-Supplier, 3-Organisation, 4-Company';

class HalmarkNewUsersCreateList {
  @IsString()
  @ApiProperty({})
  email: string;

  @IsString()
  @ApiProperty({})
  name: string;

  @IsNumber()
  @ApiProperty({})
  gender: number;

  @IsString()
  @ApiProperty({})
  mobile: string;

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListDataGuard })
  dataGuard: number[];
}
export class HalmarkCreateDto {
  @IsString()
  @ApiProperty({})
  cityId: string;

  @IsString()
  @ApiProperty({})
  ahcNo: string;

  @IsString()
  @ApiProperty({})
  mobile: string;

  @IsString()
  @ApiProperty({})
  email: string;


  @IsString()
  @ApiProperty({})
  address: string;

  @IsString()
  @ApiProperty({})
  name: string;

  @IsArray()
  @ApiProperty({ type: [Number] })
  location: number[];

  @IsArray()
  @ApiProperty({ type: [String] })
  arrayUserIdsEsixting: string[];
  @IsArray()
  @ApiProperty({ type: [HalmarkNewUsersCreateList] })
  @ValidateNested({ each: true })
  @Type(() => HalmarkNewUsersCreateList)
  arrayUsersNew: HalmarkNewUsersCreateList[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListDataGuard })
  dataGuard: number[];
}

export class HalmarkEditDto {
  @IsString()
  @ApiProperty({})
  halmarkCenterId: string;

  @IsString()
  @ApiProperty({})
  email: string;


  @IsString()
  @ApiProperty({})
  cityId: string;

  @IsString()
  @ApiProperty({})
  ahcNo: string;

  @IsString()
  @ApiProperty({})
  mobile: string;

  @IsString()
  @ApiProperty({})
  address: string;

  @IsString()
  @ApiProperty({})
  name: string;

  @IsObject()
  @ApiProperty({})
  location: Object;

  @IsArray()
  @ApiProperty({ type: [String] })
  arrayAddUserIdsEsixting: string[];
  @IsArray()
  @ApiProperty({ type: [String] })
  arrayRemoveUserIdsEsixting: string[];

  @IsArray()
  @ApiProperty({ type: [HalmarkNewUsersCreateList] })
  @ValidateNested({ each: true })
  @Type(() => HalmarkNewUsersCreateList)
  arrayUsersNew: HalmarkNewUsersCreateList[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListDataGuard })
  dataGuard: number[];
}

export class HalmarkAddRemoveUsersDto {
  @IsString()
  @ApiProperty({})
  halmarkCenterId: string;

  @IsArray()
  @ApiProperty({ type: [String] })
  arrayAddUserIdsEsixting: string[];
  @IsArray()
  @ApiProperty({ type: [String] })
  arrayRemoveUserIdsEsixting: string[];

  @IsArray()
  @ApiProperty({ type: [HalmarkNewUsersCreateList] })
  @ValidateNested({ each: true })
  @Type(() => HalmarkNewUsersCreateList)
  arrayUsersNew: HalmarkNewUsersCreateList[];
}

export class HalmarkListDto {
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
  halmarkIds: string[];
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

export class HalmarkStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  halmarkIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}
