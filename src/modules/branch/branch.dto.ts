import { ArrayContains, ArrayMinSize, IsArray, IsDefined, IsEmail, IsEmpty, IsJSON, IsNumber, IsObject, IsOptional, IsString, ValidateNested, ValidationTypes } from 'class-validator'
import { ApiProperty } from "@nestjs/swagger"
import { Type, Type as ValidateTypes } from "class-transformer"
import { Optional } from '@nestjs/common';
 
const descriptionListScreenTypeForBranchList="0-total documents count";

const descriptionStatus="0-Inactive, 1-Active, 2-Delete";

export class BranchCreateDto {
    @IsString()
    @ApiProperty({})
    name: string;

    @IsEmail()
    @ApiProperty({})
    email: string;

    @IsString()
    @ApiProperty({})
    mobile: string;

    @IsString()
    @ApiProperty({})
    textCode: string;


    
}
export class BranchEditDto {
  

    @IsString()
    @ApiProperty({})
    branchId: string;

    @IsString()
    @ApiProperty({})
    name: string;

    @IsEmail()
    @ApiProperty({})
    email: string;

    @IsString()
    @ApiProperty({})
    mobile: string;

    @IsString()
    @ApiProperty({})
    textCode: string;

}

export class BranchListDto {

    @IsArray()
    @ApiProperty({ type: [Number],description:descriptionListScreenTypeForBranchList })
    screenType:number[];
    
    

    @IsArray()
    @ApiProperty({ type: [String] })
    branchIds: string[];

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


export class BranchStatusChangeDto {


    @IsArray()
    @ApiProperty({ type: [String] })
    branchIds: string[];


    @IsNumber()
    @ApiProperty({description:descriptionStatus})
    status: number;

}








