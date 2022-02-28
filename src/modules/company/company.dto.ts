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





class CompanyCreateList {

  @IsString()
  @ApiProperty({})
  name: string;

  @IsString()
  @ApiProperty({})
  place: string;

  @IsEmail()
  @ApiProperty({})
  email: string;

  
  

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
  
}


export class CompanyCreateDto {
  @IsArray()
  @ApiProperty({type:[CompanyCreateList]})
  @ValidateNested({ each: true })
  @Type(() => CompanyCreateList)
  array: CompanyCreateList[];

  
}
export class CompanyEditDto {


  @IsString()
  @ApiProperty({})
  companyId: string;
  @IsString()
  @ApiProperty({})
  name: string;

  @IsString()
  @ApiProperty({})
  place: string;

  @IsEmail()
  @ApiProperty({})
  email: string;

  
  

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
}

export class CompanyListDto {
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number],description:descriptionStatus })
  statusArray:number[];

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListScreenTypeForList })
  screenType:number[];
  
  

  @IsArray()
  @ApiProperty({ type: [String] })
  companyIds: string[];

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


export class CompanyStatusChangeDto {


  @IsArray()
  @ApiProperty({ type: [String] })
  companyIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}
export class CheckEmailExistDto {
  
  @IsString()
  @ApiProperty({})
  value: string;

}
  
export class CheckNameExistDto {
  
  @IsString()
  @ApiProperty({})
  value: string;

}
  