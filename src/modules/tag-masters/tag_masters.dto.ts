import {
  ArrayContains,
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsEmail,
  IsEmpty,
  IsJSON,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  ValidationTypes,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type, Type as ValidateTypes } from 'class-transformer';
import { Optional } from '@nestjs/common';

const descriptionListScreenTypeForBranchList =
  '0-total documents count,100-tag documets, 101 - dag documents under[100] global gallery details';
  const descriptionListScreenTypeForTagProductLinkingList =
    '0-total documents count,100-product details, 101 - product details under[100] document linkung list, 102 - product details under[100] document linkung list under[101] global gallery detils';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';

const descriptionStatus = '0-Inactive, 1-Active, 2-Delete';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType = '0-Created Date, 1-Status,2-Name, 3-Priority';
const descriptionListSortTypeTagLinkedProducts = '0-Created Date, 1-Status';
const descriptionType="0-tag, 1-sub tag";
const descriptionListDocType = '0-image, 1-video, 2-pdf, 3-audio, 4-document';

const descriptionFileOriginalName =
  "file name givent while uploading, if there is no image then give 'nil; here";



class orderSaleCreateList {
  @IsString()
  @ApiProperty({ description: descriptionFileOriginalName })
  fileOriginalName: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionListDocType })
  docType: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({  })
  priority: number;
}
export class TagMasterCreateDto {
  @IsString()
  @ApiProperty({})
  name: string;
  
  @IsString()
  @ApiProperty({})
  tagId: string;
  
  
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  priority: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({description:descriptionType})
  type: number;

  
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  isShowEcommerce: number;


  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [orderSaleCreateList] })
  @ValidateNested({ each: true })
  @Type(() => orderSaleCreateList)
  arrayDocuments: orderSaleCreateList[];

  
  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListDataGuard })
  dataGuard: number[];
}
export class TagMasterEditDto {
  @IsString()
  @ApiProperty({})
  tagMasterId: string;

  @IsString()
  @ApiProperty({})
  name: string;
  
  @IsString()
  @ApiProperty({})
  tagId: string;
  
  
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  priority: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({description:descriptionType})
  type: number;

  
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  isShowEcommerce: number;


  
  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListDataGuard })
  dataGuard: number[];
}

export class TagMasterListDto {
  @IsNumber()
  @ApiProperty({ description: descriptionListSortType })
  sortType: number;
  @IsNumber()
  @ApiProperty({ description: descriptionListSortOrder })
  sortOrder: number;

  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number], description: descriptionStatus })
  statusArray: number[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionListScreenTypeForBranchList,
  })
  screenType: number[];


  @IsArray()
  @ApiProperty({ type: [Number], })
  responseFormat: number[];
  

  
  

  @IsArray()
  @ApiProperty({ type: [Number], })
  isShowEcommerce: number[];
  

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionType })
  type: number[];
  
  @IsArray()
  @ApiProperty({ type: [String] })
  tagMasterIds: string[];


  @IsArray()
  @ApiProperty({ type: [String] })
  parentTagMasterIds: string[];

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




export class TagLinkedProductListDto {
  @IsNumber()
  @ApiProperty({ description: descriptionListSortTypeTagLinkedProducts })
  sortType: number;
  @IsNumber()
  @ApiProperty({ description: descriptionListSortOrder })
  sortOrder: number;

  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number], description: descriptionStatus })
  statusArray: number[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionListScreenTypeForBranchList,
  })
  screenType: number[];


  @IsArray()
  @ApiProperty({ type: [Number], })
  responseFormat: number[];
  

  @IsArray()
  @ApiProperty({ type: [String] })
  tagIds: string[];




  
  @IsNumber()
  @ApiProperty({})
  gwStart: number;

  
  @IsNumber()
  @ApiProperty({})
  gwEnd: number;

  @IsNumber()
  @ApiProperty({})
  nwStart: number;

  
  @IsNumber()
  @ApiProperty({})
  nwEnd: number;

  @IsNumber()
  @ApiProperty({})
  swStart: number;

  
  @IsNumber()
  @ApiProperty({})
  swEnd: number;

  
  


  
  
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

export class TagMasterStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  tagMasterIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}

export class CheckNameExistDto {
  @IsString()
  @ApiProperty({})
  value: string;

  @IsArray()
  @ApiProperty({ type: [String] })
  existingIds: string[];
}
