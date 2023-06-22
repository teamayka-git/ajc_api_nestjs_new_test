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
const descriptionListScreenTypeForList = '0-total documents count,   100-material receipt items';



class MaterialReceiptCreateList {
  @IsString()
  @ApiProperty({})
  groupId: string;

  @IsNumber()
  @ApiProperty({})
  grossWeight: number;

  @IsNumber()
  @ApiProperty({})
  stoneWeight: number;

  @IsNumber()
  @ApiProperty({})
  netWeight: number;

  @IsNumber()
  @ApiProperty({})
  tough: number;


  @IsNumber()
  @ApiProperty({})
  pureWeightHundred: number;


  
  
  @IsNumber()
  @ApiProperty({})
  meltingPurity: number;
  @IsNumber()
  @ApiProperty({})
  pureWeightRB: number;

  
  @IsString()
  @ApiProperty({})
  subcategoryId: string;
  
}

export class MaterialReceiptCreateDto {


  @IsString()
  @ApiProperty({})
  shopId: string;

  @IsString()
  @ApiProperty({})
  shopUserId: string;

  @IsString()
  @ApiProperty({})
  remark: string;



  @IsNumber()
  @ApiProperty({})
  receiptDate: number;

  @IsArray()
  @ApiProperty({ type: [MaterialReceiptCreateList] })
  @ValidateNested({ each: true })
  @Type(() => MaterialReceiptCreateList)
  array: MaterialReceiptCreateList[];
}






class MaterialReceiptEditList {

  
  @IsString()
  @ApiProperty({})
  groupId: string;

  @IsNumber()
  @ApiProperty({})
  grossWeight: number;

  @IsNumber()
  @ApiProperty({})
  stoneWeight: number;

  @IsNumber()
  @ApiProperty({})
  netWeight: number;

  @IsNumber()
  @ApiProperty({})
  tough: number;

  @IsNumber()
  @ApiProperty({})
  pureWeightHundred: number;

  
  
  @IsNumber()
  @ApiProperty({})
  meltingPurity: number;
  @IsNumber()
  @ApiProperty({})
  pureWeightRB: number;

  
  @IsString()
  @ApiProperty({})
  subcategoryId: string;
  
}

export class MaterialReceiptEditDto {

  @IsString()
  @ApiProperty({})
  materialReceiptId: string;

  @IsString()
  @ApiProperty({})
  uid: string;

  @IsString()
  @ApiProperty({})
  shopId: string;

  @IsString()
  @ApiProperty({})
  shopUserId: string;

  @IsString()
  @ApiProperty({})
  remark: string;



  @IsNumber()
  @ApiProperty({})
  receiptDate: number;

  @IsArray()
  @ApiProperty({ type: [MaterialReceiptEditList] })
  @ValidateNested({ each: true })
  @Type(() => MaterialReceiptEditList)
  array: MaterialReceiptEditList[];
}



export class MaterialReceiptListDto {
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
  materialReceiptIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  shopIds: string[];

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

export class MaterialReceiptStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  materialReceiptIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;

  
  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  fromStatus: number;
}
export class CheckNameExistDto {
  @IsString()
  @ApiProperty({})
  value: string;

  @IsArray()
  @ApiProperty({ type: [String] })
  existingIds: string[];
}
