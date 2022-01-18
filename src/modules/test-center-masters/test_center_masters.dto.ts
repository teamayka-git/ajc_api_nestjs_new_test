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





class TestCenterMastersCreateList {

  @IsString()
  @ApiProperty({})
  name: string;

  @IsString()
  @ApiProperty({})
  place: string;

  
  @IsNumber()
  @ApiProperty({})
  code: number;

  @IsNumber()
  @ApiProperty({})
  allowedWastage: number;

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
  
}


export class TestCenterMastersCreateDto {
  @IsArray()
  @ApiProperty({type:[TestCenterMastersCreateList]})
  @ValidateNested({ each: true })
  @Type(() => TestCenterMastersCreateList)
  array: TestCenterMastersCreateList[];

  
}
export class TestCenterMastersEditDto {


  @IsString()
  @ApiProperty({})
  testCenterMasterId: string;

  
  @IsString()
  @ApiProperty({})
  name: string;

  @IsString()
  @ApiProperty({})
  place: string;

  
  @IsNumber()
  @ApiProperty({})
  code: number;

  @IsNumber()
  @ApiProperty({})
  allowedWastage: number;

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
}

export class TestCenterMastersListDto {
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number],description:descriptionStatus })
  statusArray:number[];

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListScreenTypeForList })
  screenType:number[];
  
  

  @IsArray()
  @ApiProperty({ type: [String] })
  testCenterMastersIds: string[];

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


export class TestCenterMastersStatusChangeDto {


  @IsArray()
  @ApiProperty({ type: [String] })
  testCenterMastersIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}
