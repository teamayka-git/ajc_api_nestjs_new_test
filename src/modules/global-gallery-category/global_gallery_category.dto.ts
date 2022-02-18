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
const descriptionListDataGuard="0-edit protect, 1-disabe protect, 2-delete protect, 3-default folder will be there";

const descriptionListSortOrder="1-ascending, -1-descending";
const descriptionListSortType="0-Created Date, 1-Status,2-Name";
const descriptionType="1-main category, 2-sub category";



class GlobalGalleryCategoryCreateList {

  @IsString()
  @ApiProperty({})
  name: string;


  
  @IsNumber()
  @ApiProperty({description:descriptionType})
type: number;

  

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
  @IsString()
  @ApiProperty({})
  globalGalleryCategoryId: string;


}


export class GlobalGalleryCategoryCreateDto {
  @IsArray()
  @ApiProperty({type:[GlobalGalleryCategoryCreateList]})
  @ValidateNested({ each: true })
  @Type(() => GlobalGalleryCategoryCreateList)
  array: GlobalGalleryCategoryCreateList[];

  
}
export class GlobalGalleryCategoryEditDto {


  @IsString()
  @ApiProperty({})
  globalGalleryCategoryIdForEdit: string;

  @IsString()
  @ApiProperty({})
  name: string;

  @IsString()
  @ApiProperty({})
  globalGalleryCategoryId: string;

  
  @IsNumber()
  @ApiProperty({description:descriptionType})
type: number;

  
  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
}

export class GlobalGalleryCategoryListDto {

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
  @ApiProperty({ type: [Number],description:descriptionType })
  type:number[];
  
  

  @IsArray()
  @ApiProperty({ type: [String] })
  globalGalleryIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  globalGalleryCategoryIds: string[];

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


export class GlobalGalleryCategoryStatusChangeDto {


  @IsArray()
  @ApiProperty({ type: [String] })
  globalGalleryIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}
