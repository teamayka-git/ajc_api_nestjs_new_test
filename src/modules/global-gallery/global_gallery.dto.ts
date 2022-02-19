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
const descriptionListScreenTypeForList="0-total documents count,100-category details populate";
const descriptionListType=" -1-other   0-category, 1-sub category, 2-stone, 3-agent, 4-branch, 5-employee, 6-supplier, 7-customer";
const descriptionListDocType="0-image, 1-video, 2-pdf, 3-audio, 4-document";



class GlobalGalleryCreateList {

  @IsString()
  @ApiProperty({})
  originalname: string;

  @IsString() 
  @ApiProperty({})
  name: string;


  @IsString()
  @ApiProperty({})
  categoryId: string;

  
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({description:descriptionListDocType})
  docType: number;
  
  
  
}


export class GlobalGalleryCreateDto {
  @Transform(({ value }) =>
  typeof value == 'string' ? JSON.parse(value) : value,
    )
  @IsArray()
  @ApiProperty({type:[GlobalGalleryCreateList]})
  @ValidateNested({ each: true })
  @Type(() => GlobalGalleryCreateList)
  array: GlobalGalleryCreateList[];




  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({description:descriptionListType})
  type: Number;
  
}

export class GlobalGalleryListDto {
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number],description:descriptionStatus })
  statusArray:number[];

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListScreenTypeForList })
  screenType:number[];
  
  

  @IsArray()
  @ApiProperty({ type: [String] })
  globalGalleryIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  categoryIds: string[];


  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDocType })
  docTypes:number[];
  
  
  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListType })
  types:number[];
  
  

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




export class GlobalGalleryStatusChangeDto {


  @IsArray()
  @ApiProperty({ type: [String] })
  globalGalleryIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}
export class HomeDefaultFolderDto {


  

  @IsNumber()
  @ApiProperty({})
  type: number;

}
export class HomeItemsDto {


  

  @IsString()
  @ApiProperty({})
  categoryId: string;

}
