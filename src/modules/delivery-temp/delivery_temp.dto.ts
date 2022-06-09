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
  '0-total documents count,100-filter not employee assigned, 101-employee details, 102-hub details, 103-invoice details, 104-invoice items only if invoice details existing, 105-filer employee with my id also';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType = '0-Created Date, 1-Status,2-type';
const descriptionListScreenTypeForFilterLoading =
  '0-total documents count, 100-item details';


const descriptionType="0 - delivery to shop, 1 - hub transfer";

class DeliveryTempCreateList {
  @IsString()
  @ApiProperty({})
  invoiceId: string;

  @IsNumber()
  @ApiProperty({description:descriptionType})
  type: number;

  @IsString()
  @ApiProperty({})
  employeeId: string;

  @IsString()
  @ApiProperty({})
  hubId: string;

}

export class DeliveryTempCreateDto {
  @IsArray()
  @ApiProperty({ type: [DeliveryTempCreateList] })
  @ValidateNested({ each: true })
  @Type(() => DeliveryTempCreateList)
  array: DeliveryTempCreateList[];
}
export class CitiesEditDto {
  @IsString()
  @ApiProperty({})
  citiesId: string;
  @IsString()
  @ApiProperty({})
  name: string;

  @IsNumber()
  @ApiProperty({})
  code: number;

  @IsString()
  @ApiProperty({})
  districtsId: string;

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListDataGuard })
  dataGuard: number[];
}

export class DeliveryTempListDto {
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
  deliveryTempIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  invoiceIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  employeeIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  hubIds: string[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionType })
  typeArray: number[];

  @IsNumber()
  @ApiProperty({})
  limit: number;

  @IsNumber()
  @ApiProperty({})
  skip: number;

}

export class DeliveryTempEmployeeAssignDto {
  
  @IsArray()
  @ApiProperty({ type: [String] })
  deliveryTempIds: string[];

  @IsString()
  @ApiProperty({})
  employeeId: string;

}