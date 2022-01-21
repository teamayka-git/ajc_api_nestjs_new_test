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
const descriptionListScreenTypeForList="0-total documents count, 100-category details";
const descriptionListDataGuard="0-edit protect, 1-disabe protect, 2-delete protect";



class SubCategoriesCreateList {

  @IsString()
  @ApiProperty({})
  name: string;

  
  @IsNumber()
  @ApiProperty({})
  code: number;

  @IsString()
  @ApiProperty({})
  description: string;

  @IsString()
  @ApiProperty({})
  categoryId: string;

  
  @IsNumber()
  @ApiProperty({})
  hmsealing: number;
  @IsNumber()
  @ApiProperty({})
  defaultValueAdditionPercentage: number;

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
  
}


export class SubCategoriesCreateDto {
  @IsArray()
  @ApiProperty({type:[SubCategoriesCreateList]})
  @ValidateNested({ each: true })
  @Type(() => SubCategoriesCreateList)
  array: SubCategoriesCreateList[];

  
}
export class SubCategoriesEditDto {


  @IsString()
  @ApiProperty({})
  subCategoryId: string;
 
  @IsString()
  @ApiProperty({})
  name: string;

  
  @IsNumber()
  @ApiProperty({})
  code: number;

  @IsString()
  @ApiProperty({})
  description: string;

  @IsString()
  @ApiProperty({})
  categoryId: string;

  
  @IsNumber()
  @ApiProperty({})
  hmsealing: number;
  @IsNumber()
  @ApiProperty({})
  defaultValueAdditionPercentage: number;

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
}

export class SubCategoriesListDto {
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number],description:descriptionStatus })
  statusArray:number[];

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListScreenTypeForList })
  screenType:number[];
  
  

  @IsArray()
  @ApiProperty({ type: [String] })
  subCategoryIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  categoryIds: string[];

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


export class SubCategoriesStatusChangeDto {


  @IsArray()
  @ApiProperty({ type: [String] })
  subCategoryIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}
