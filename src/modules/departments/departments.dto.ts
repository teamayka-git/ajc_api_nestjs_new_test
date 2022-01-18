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



class DepartmentCreateList {

  @IsString()
  @ApiProperty({})
  name: string;

  
  @IsNumber()
  @ApiProperty({})
  code: number;


  @IsString()
  @ApiProperty({})
  prefix: string;

  
}


export class DepartmentCreateDto {
  @IsArray()
  @ApiProperty({type:[DepartmentCreateList]})
  @ValidateNested({ each: true })
  @Type(() => DepartmentCreateList)
  array: DepartmentCreateList[];

  
}
export class DepartmentEditDto {


  @IsString()
  @ApiProperty({})
  departmentId: string;
 
  @IsString()
  @ApiProperty({})
  name: string;

  
  @IsNumber()
  @ApiProperty({})
  code: number;


  @IsString()
  @ApiProperty({})
  prefix: string;

  
}

export class DepartmentListDto {
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number],description:descriptionStatus })
  statusArray:number[];

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListScreenTypeForList })
  screenType:number[];
  
  

  @IsArray()
  @ApiProperty({ type: [String] })
  departmentIds: string[];

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


export class DepartmentStatusChangeDto {


  @IsArray()
  @ApiProperty({ type: [String] })
  departmentIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}
