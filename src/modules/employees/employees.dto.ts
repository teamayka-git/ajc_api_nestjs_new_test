import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNumber,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type, Type as ValidateTypes } from 'class-transformer';
import { Optional } from '@nestjs/common';

const descriptionListDataGuard="0-edit protect, 1-disabe protect, 2-delete protect";
const descriptionListGender="0-male, 1-female, 2-other";
const descriptionStatus="0-Inactive, 1-Active, 2-Delete";
const descriptionListSortOrder="1-ascending, -1-descending";
const descriptionListSortType="0-Created Date,1-Status  2-Name,3-UID";
const descriptionListScreenTypeForList="0-total documents count, ,50-populate image global gallery, 100-user id also get";

export class EmployeeLoginDto {
 
  @IsEmail()
  @ApiProperty({})
  email: string;

    @IsString()
    @ApiProperty({})
    password: string;
}


export class EmployeeCreateDto {

  @IsString()
  @ApiProperty({})
  name: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({description:descriptionListGender})
  gender: number;


  @IsEmail()
  @ApiProperty({})
  email: string;

  @IsString()
  @ApiProperty({})
  password: string;

  @IsString()
  @ApiProperty({})
  mobile: string;

  

  @Transform(({ value }) =>typeof value == 'string' ? JSON.parse(value) : value    )
  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
  
}



export class EmployeeEditDto {


  @IsString()
  @ApiProperty({})
  employeeId: string;

  @IsString()
  @ApiProperty({})
  name: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({description:descriptionListGender})
  gender: number;


  @IsEmail()
  @ApiProperty({})
  email: string;


  @IsString()
  @ApiProperty({})
  mobile: string;

  

  @Transform(({ value }) =>typeof value == 'string' ? JSON.parse(value) : value    )
  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
}

export class EmployeeListDto {
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
  @ApiProperty({ type: [Number],description:descriptionListGender })
  genders:number[];
  
  
  @IsArray()
  @ApiProperty({ type: [String] })
  employeeIds: string[];

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


export class EmployeeStatusChangeDto {


  @IsArray()
  @ApiProperty({ type: [String] })
  employeeIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}

export class CheckEmailExistDto {
  
  @IsString()
  @ApiProperty({})
  value: string;

}
export class CheckMobileExistDto {
  
  @IsString()
  @ApiProperty({})
  value: string;

}