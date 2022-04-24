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
  '0-total documents count, 100-user details';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';
const descriptionListType =
  ' 0-Employee, 1-Shop, 2-Supplier, 3-Organisation, 4-Company';

class BanksCreateList {
  @IsString()
  @ApiProperty({})
  userId: string;

  @IsString()
  @ApiProperty({})
  acNo: string;

  @IsString()
  @ApiProperty({})
  ifsc: string;

  @IsString()
  @ApiProperty({})
  acHolderName: string;

  @IsString()
  @ApiProperty({})
  branchName: string;

  @IsNumber()
  @ApiProperty({ description: descriptionListType })
  type: number;

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListDataGuard })
  dataGuard: number[];
}

export class BanksCreateDto {
  @IsArray()
  @ApiProperty({ type: [BanksCreateList] })
  @ValidateNested({ each: true })
  @Type(() => BanksCreateList)
  array: BanksCreateList[];
}
export class BanksEditDto {
  @IsString()
  @ApiProperty({})
  userId: string;

  @IsString()
  @ApiProperty({})
  bankId: string;

  @IsString()
  @ApiProperty({})
  acNo: string;

  @IsString()
  @ApiProperty({})
  ifsc: string;

  @IsString()
  @ApiProperty({})
  acHolderName: string;

  @IsString()
  @ApiProperty({})
  branchName: string;

  @IsNumber()
  @ApiProperty({ description: descriptionListType })
  type: number;

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListDataGuard })
  dataGuard: number[];
}

export class BanksListDto {
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
  @ApiProperty({ type: [Number], description: descriptionListType })
  types: number[];

  @IsArray()
  @ApiProperty({ type: [String] })
  bankIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  userIds: string[];

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

export class BanksStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  bankIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}
