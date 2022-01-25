import { ArrayContains, ArrayMinSize, IsArray, IsDefined, IsEmail, IsEmpty, IsJSON, IsNumber, IsObject, IsOptional, IsString, ValidateNested, ValidationTypes } from 'class-validator'
import { ApiProperty } from "@nestjs/swagger"
import { Type, Type as ValidateTypes } from "class-transformer"
import { Optional } from '@nestjs/common';
 
const descriptionListScreenTypeForBranchList="0-total documents count,100-populate image global gallery";
const descriptionListDataGuard="0-edit protect, 1-disabe protect, 2-delete protect";

const descriptionStatus="0-Inactive, 1-Active, 2-Delete";
const descriptionListSortOrder="1-ascending, -1-descending";
const descriptionListSortType="0-Created Date, 1-Status,2-Name, 3-UID";


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

    @IsArray()
    @ApiProperty({ type: [Number],description:descriptionListDataGuard })
    dataGuard:number[];
    
    

    
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

    
    @IsArray()
    @ApiProperty({ type: [Number],description:descriptionListDataGuard })
    dataGuard:number[];
    

}

export class BranchListDto {


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








