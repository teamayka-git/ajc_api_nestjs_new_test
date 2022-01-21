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
const descriptionListScreenTypeForList="0-total documents count, 100-group details";
const descriptionListDataGuard="0-edit protect, 1-disabe protect, 2-delete protect";





class TestChargeMastersCreateList {

  @IsString()
  @ApiProperty({})
  groupId: string;

  
  @IsNumber()
  @ApiProperty({})
  charge: number;

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
  
}


export class TestChargeMastersCreateDto {
  @IsArray()
  @ApiProperty({type:[TestChargeMastersCreateList]})
  @ValidateNested({ each: true })
  @Type(() => TestChargeMastersCreateList)
  array: TestChargeMastersCreateList[];

  
}
export class TestChargeMastersEditDto {


  @IsString()
  @ApiProperty({})
  testChargeMastersId: string;

  
  @IsString()
  @ApiProperty({})
  groupId: string;

  
  @IsNumber()
  @ApiProperty({})
  charge: number;

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
}

export class TestChargeMastersListDto {
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number],description:descriptionStatus })
  statusArray:number[];

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListScreenTypeForList })
  screenType:number[];
  
  

  @IsArray()
  @ApiProperty({ type: [String] })
  testChargeMastersIds: string[];

  @IsNumber()
  @ApiProperty({})
  limit: number;


  @IsNumber()
  @ApiProperty({})
  skip: number;


  
}


export class TestChargeMastersStatusChangeDto {


  @IsArray()
  @ApiProperty({ type: [String] })
  testChargeMastersIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}
