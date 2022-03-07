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
const descriptionListScreenTypeForList="0-total documents count,50-populate image global gallery, 100-category details";
const descriptionListDataGuard="0-edit protect, 1-disabe protect, 2-delete protect";

const descriptionListSortOrder="1-ascending, -1-descending";
const descriptionListSortType="0-Created Date, 1-Status,2-Name, 3-Code";
const descriptionListScreenTypeForFilterLoading="0-total documents count, 100-item details";
const descriptionFileOriginalName="file name givent while uploading, if there is no image then give 'nil; here";


class SubCategoriesCreateList {

  @IsString()
  @ApiProperty({})
  name: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  code: number;
  
  @IsString()
  @ApiProperty({description:descriptionFileOriginalName})
  fileOriginalName: string;

  @IsString()
  @ApiProperty({})
  description: string;

  @IsString()
  @ApiProperty({})
  categoryId: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  hmsealing: number;
  
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  defaultValueAdditionPercentage: number;
  @Transform(({ value }) =>typeof value == 'string' ? JSON.parse(value) : value    )
  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  defaultPercentage: number;
  
}


export class SubCategoriesCreateDto {
  @Transform(({ value }) =>typeof value == 'string' ? JSON.parse(value) : value    )
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

  
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  code: number;

  @IsString()
  @ApiProperty({})
  description: string;

  @IsString()
  @ApiProperty({})
  categoryId: string;

  
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  hmsealing: number;
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  defaultValueAdditionPercentage: number;
  @Transform(({ value }) =>typeof value == 'string' ? JSON.parse(value) : value    )
  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
}

export class SubCategoriesListDto {


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
export class ListFilterLocadingSubCategoryDto {
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
export class CheckItemExistDto {
  
  @IsString()
  @ApiProperty({})
  value: string;

}
export class CheckNameExistDto {
  
  @IsString()
  @ApiProperty({})
  value: string;

}
  