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
const descriptionListSortType = '0-Created Date, 1-Status,2-Name, 3-Purity';

class AccountHeadCreateList {
  @IsString()
  @ApiProperty({})
  name: string;

  @IsNumber()
  @ApiProperty({})
  purity: number;

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListDataGuard })
  dataGuard: number[];
}

export class AccountHeadCreateDto {
  @IsArray()
  @ApiProperty({ type: [AccountHeadCreateList] })
  @ValidateNested({ each: true })
  @Type(() => AccountHeadCreateList)
  array: AccountHeadCreateList[];
}