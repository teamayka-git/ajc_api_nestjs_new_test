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
const descriptionListScreenTypeForList="0-total documents count, 100-Group master details";
const descriptionListDataGuard="0-edit protect, 1-disabe protect, 2-delete protect";
const descriptionListSortOrder="1-ascending, -1-descending";
const descriptionListSortType="0-Created Date, 1-Status,2-Name, 3-Code";
const descriptionListScreenTypeForFilterLoading="0-total documents count";



class CategoriesCreateList {

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
  groupId: string;

  
  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  

  
}


export class CategoriesCreateDto {
  @IsArray()
  @ApiProperty({type:[CategoriesCreateList]})
  @ValidateNested({ each: true })
  @Type(() => CategoriesCreateList)
  array: CategoriesCreateList[];

  
}
export class CategoriesEditDto {


  @IsString()
  @ApiProperty({})
  categoryId: string;
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
  groupId: string;

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
}

export class CategoriesListDto {



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
  @ApiProperty({ type: [String] })
  categoryIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  groupIds: string[];

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


export class CategoriesStatusChangeDto {


  @IsArray()
  @ApiProperty({ type: [String] })
  categoryIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}
export class ListFilterLocadingCategoryDto {
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number],description:descriptionStatus })
  statusArray:number[];

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListScreenTypeForFilterLoading })
  screenType:number[];
  
  @IsNumber()
  @ApiProperty({})
  limit: number;


  @IsNumber()
  @ApiProperty({})
  skip: number;

}