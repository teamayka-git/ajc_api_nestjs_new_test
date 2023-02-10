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
const descriptionListScreenTypeForList = '0-total documents count, 50- global gallery mobile details, 51- global gallery desktop details';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType = '0-Created Date, 1-Status,2-Type, 3-Priority 4-Group';
const descriptionType=" 0 - main images, 1 - slide images";

class StorePromotionsCreateList {

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({description:descriptionType})
  type: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  priority: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  group: number;

  @IsString()
  @ApiProperty({})
  fileDeskOriginalName: string;

  
  @IsString()
  @ApiProperty({})
  fileMobOriginalName: string;

  
}

export class StorePromotionsCreateDto {
  @IsArray()
  @ApiProperty({ type: [StorePromotionsCreateList] })
  @ValidateNested({ each: true })
  @Type(() => StorePromotionsCreateList)
  array: StorePromotionsCreateList[];
}

export class StorePromotionsListDto {
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
  storePromotionIds: string[];

  @IsNumber()
  @ApiProperty({})
  limit: number;

  @IsNumber()
  @ApiProperty({})
  skip: number;

}

export class StorePromotionsStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  storePromotionIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}