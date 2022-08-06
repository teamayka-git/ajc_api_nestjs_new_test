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
const descriptionListScreenTypeForList = '0-total documents count, 100-city details, 101-district details and state details only if city details exist,';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';

class CompanyCreateList {
  @IsString()
  @ApiProperty({})
  name: string;
  @IsString()
  @ApiProperty({})
  address: string;
  @IsString()
  @ApiProperty({})
  phone: string;

  @IsString()
  @ApiProperty({})
  place: string;

  @IsEmail()
  @ApiProperty({})
  email: string;

  
  @IsEmail()
  @ApiProperty({})
  cityId: string;

  @IsEmail()
  @ApiProperty({})
  pan: string;

  @IsEmail()
  @ApiProperty({})
  gst: string;

  @IsEmail()
  @ApiProperty({})
  cin: string;

  

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListDataGuard })
  dataGuard: number[];
}

export class CompanyCreateDto {
  @IsArray()
  @ApiProperty({ type: [CompanyCreateList] })
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

  @IsEmail()
  @ApiProperty({})
  cityId: string;


  @IsEmail()
  @ApiProperty({})
  pan: string;

  @IsEmail()
  @ApiProperty({})
  gst: string;

  @IsEmail()
  @ApiProperty({})
  cin: string;

  @IsString()
  @ApiProperty({})
  address: string;
  @IsString()
  @ApiProperty({})
  phone: string;


  
  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListDataGuard })
  dataGuard: number[];
}

export class CompanyListDto {
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
  @ApiProperty({ description: descriptionStatus })
  status: number;
}
export class CheckEmailExistDto {
  @IsString()
  @ApiProperty({})
  value: string;

  @IsArray()
  @ApiProperty({ type: [String] })
  existingIds: string[];
}

export class CheckNameExistDto {
  @IsString()
  @ApiProperty({})
  value: string;

  @IsArray()
  @ApiProperty({ type: [String] })
  existingIds: string[];
}
