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


const descriptionStatus="0-Inactive, 1-Active, 2-Delete";
const descriptionListScreenTypeForList="0-total documents count";
const descriptionListForCodes="1000-currency denominator text, 1001-currency denominator symbol, 1002-product floating digit weight, 1003-product purity, 1004-customer credit amount limit percentage, 1005-customer credit days limit, 1006-tax gold manufacturing tax rate %, 1007-tax product CGST %, 1008-tax product SGST %, 1009-tax product IGST %, 1010-tax holemarking tax %, 1011-tax other charge tax %, 1012-tax job work tax %, 1013-order sale new order suffix, 1014-order sale new order prefix, 1015-order sale new order suffix status, 1016-order sale new order prefix status, 1017-order headname prefix ";



class GeneralsCreateList {

  @IsString()
  @ApiProperty({})
  string: string;

  
  @IsNumber()
  @ApiProperty({description:descriptionListForCodes})
  code: number;

  @IsNumber()
  @ApiProperty({})
  number:number;

  @IsObject()
  @ApiProperty({})
  json:object;


  
}


export class GeneralsCreateDto {
  @IsArray()
  @ApiProperty({type:[GeneralsCreateList]})
  @ValidateNested({ each: true })
  @Type(() => GeneralsCreateList)
  array: GeneralsCreateList[];

  
}
export class GeneralsEditDto {


  @IsString()
  @ApiProperty({})
  generalstId: string;

  @IsString()
  @ApiProperty({})
  string: string;

  
  @IsNumber()
  @ApiProperty({description:descriptionListForCodes})
  code: number;

  @IsNumber()
  @ApiProperty({})
  number:number;

  @IsObject()
  @ApiProperty({})
  json:object;

}

export class GeneralsListDto {

  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number],description:descriptionStatus })
  statusArray:number[];

  @IsArray()
  @ApiProperty({ type: [String] })
  generalsIds: string[];



  @IsNumber()
  @ApiProperty({})
  limit: number;


  @IsNumber()
  @ApiProperty({})
  skip: number;



  @IsArray()
  @ApiProperty({ type: [Number] ,description:descriptionListForCodes})
  codes: number[];

  
  
}


export class GeneralsStatusChangeDto {


  @IsArray()
  @ApiProperty({ type: [String] })
  generalIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}
