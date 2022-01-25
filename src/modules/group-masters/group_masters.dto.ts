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


const descriptionStatus="0-Inactive, 1-Active, 2-Delete";
const descriptionListScreenTypeForList="0-total documents count";
const descriptionListDataGuard="0-edit protect, 1-disabe protect, 2-delete protect";
const descriptionListSortOrder="1-ascending, -1-descending";
const descriptionListSortType="0-Created Date, 1-Status,2-Name, 3-RawM aterial Status, 4-HSN Code, 5-Melting Purity, 6-Tax Percentage, 7-Purity";



class GroupMastersCreateList {

  @IsString()
  @ApiProperty({})
  name: string;
  @IsNumber()
  @ApiProperty({})
  rawMaterialStatus: number;
  
  @IsString()
  @ApiProperty({})
  hsnCode: string;

  @IsArray()
  @ApiProperty({ type: [String] })
  descriptionArray: String[];

  
  @IsNumber()
  @ApiProperty({})
  meltingPurity: number;

  @IsNumber()
  @ApiProperty({})
  taxPercentage: number;

  @IsNumber()
  @ApiProperty({})
  purity: number;

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
  
}


export class GroupMastersCreateDto {
  @IsArray()
  @ApiProperty({type:[GroupMastersCreateList]})
  @ValidateNested({ each: true })
  @Type(() => GroupMastersCreateList)
  array: GroupMastersCreateList[];

  
}
export class GroupMastersEditDto {

  @IsString()
  @ApiProperty({})
  name: string;

  @IsString()
  @ApiProperty({})
  groupMasterId: string;

  @IsNumber()
  @ApiProperty({})
  rawMaterialStatus: number;
  
  @IsString()
  @ApiProperty({})
  hsnCode: string;

  @IsArray()
  @ApiProperty({ type: [String] })
  descriptionArray: String[];

  
  @IsNumber()
  @ApiProperty({})
  meltingPurity: number;

  @IsNumber()
  @ApiProperty({})
  taxPercentage: number;

  @IsNumber()
  @ApiProperty({})
  purity: number;

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  

}

export class GroupMastersListDto {

  @IsNumber()
  @ApiProperty({description:descriptionListSortType})
  sortType: number;
  @IsNumber()
  @ApiProperty({description:descriptionListSortOrder})
  sortOrder: number;


  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number],description:descriptionStatus })
  statusArray:number[];

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListScreenTypeForList })
  screenType:number[];
  
  

  @IsArray()
  @ApiProperty({ type: [String] })
  groupMasterIds: string[];

  @IsArray()
  @ApiProperty({ type: [Number] })
  rawMaterialStatus:number[];
  
  

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


export class GroupMastersStatusChangeDto { 


  @IsArray()
  @ApiProperty({ type: [String] })
  groupMasterIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}
