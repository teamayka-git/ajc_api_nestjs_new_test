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



class GroupMastersCreateList {

  @IsString()
  @ApiProperty({})
  rawMaterialStatus: string;
  
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

  
}


export class GroupMastersCreateDto {
  @IsArray()
  @ApiProperty({type:[GroupMastersCreateList]})
  @ValidateNested({ each: true })
  @Type(() => GroupMastersCreateList)
  stateArray: GroupMastersCreateList[];

  
}
export class GroupMastersEditDto {


  @IsString()
  @ApiProperty({})
  groupMasterId: string;

  @IsString()
  @ApiProperty({})
  rawMaterialStatus: string;
  
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


}

export class GroupMastersListDto {
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
