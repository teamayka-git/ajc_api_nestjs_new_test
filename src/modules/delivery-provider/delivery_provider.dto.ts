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

class DeliveryProviderCreateList {
  @IsString()
  @ApiProperty({})
  name: string;

  @IsString()
  @ApiProperty({})
  website: string;

  @IsString()
  @ApiProperty({})
  address: string;
}

export class DeliveryProviderCreateDto {
  @IsArray()
  @ApiProperty({ type: [DeliveryProviderCreateList] })
  @ValidateNested({ each: true })
  @Type(() => DeliveryProviderCreateList)
  array: DeliveryProviderCreateList[];
}
export class DeliveryProviderEditDto {
  @IsString()
  @ApiProperty({})
  deliveryProviderId: string;

  @IsString()
  @ApiProperty({})
  name: string;

  @IsString()
  @ApiProperty({})
  website: string;

  @IsString()
  @ApiProperty({})
  address: string;
}

export class DeliveryProviderListDto {
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
  deliveryProviderIds: string[];

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

export class DeliveryProviderStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  deliveryProviderIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}
export class CheckNameExistDto {
  @IsString()
  @ApiProperty({})
  value: string;

  @IsArray()
  @ApiProperty({ type: [String] })
  existingIds: string[];
}
