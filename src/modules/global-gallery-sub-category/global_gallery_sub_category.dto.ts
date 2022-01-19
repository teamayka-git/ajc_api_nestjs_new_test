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





class GlobalGallerySubCategoryCreateList {

  @IsString()
  @ApiProperty({})
  name: string;

  
  @IsString()
  @ApiProperty({})
  globalGalleryCategoryId: string;

  

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
  
}


export class GlobalGallerySubCategoryCreateDto {
  @IsArray()
  @ApiProperty({type:[GlobalGallerySubCategoryCreateList]})
  @ValidateNested({ each: true })
  @Type(() => GlobalGallerySubCategoryCreateList)
  array: GlobalGallerySubCategoryCreateList[];

  
}
export class GlobalGallerySubCategoryEditDto {


  @IsString()
  @ApiProperty({})
  globalGalleryId: string;

  @IsString()
  @ApiProperty({})
  name: string;

  @IsString()
  @ApiProperty({})
  globalGalleryCategoryId: string;

  
  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  
}

export class GlobalGallerySubCategoryListDto {
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number],description:descriptionStatus })
  statusArray:number[];

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListScreenTypeForList })
  screenType:number[];
  
  

  @IsArray()
  @ApiProperty({ type: [String] })
  globalGallerySubCategoryIds: string[];


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


export class GlobalGallerySubCategoryStatusChangeDto {


  @IsArray()
  @ApiProperty({ type: [String] })
  globalGallerySubCategoryIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}
