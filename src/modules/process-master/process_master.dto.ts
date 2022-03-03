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
const descriptionListScreenTypeForList="0-total documents count, 100-process master details,101-sub process list";
const descriptionListDataGuard="0-edit protect, 1-disabe protect, 2-delete protect";

const descriptionListSortOrder="1-ascending, -1-descending";
const descriptionListSortType="0-Created Date, 1-Status,2-Name, 3-Code, 4-is automatic";
const descriptionListScreenTypeForFilterLoading="0-total documents count, 100-item details";




class SubProcessMasterCreateList {

  @IsString()
  @ApiProperty({})
  name: string;

  
  @IsNumber()
  @ApiProperty({})
  code: number;

  @IsNumber()
  @ApiProperty({})
  isAutomatic: number;

  @IsNumber()
  @ApiProperty({})
  maxHours: number;

  
  @IsNumber()
  @ApiProperty({})
  priority: number;


}
class ProcessMasterCreateList {

  @IsString()
  @ApiProperty({})
  name: string;

  
  @IsNumber()
  @ApiProperty({})
  code: number;

  @IsNumber()
  @ApiProperty({})
  maxHours: number;

  @IsNumber()
  @ApiProperty({})
  isAutomatic: number;

  
  @IsString()
  @ApiProperty({})
  parentId: string;

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];

  @IsArray()
  @ApiProperty({type:[SubProcessMasterCreateList]})
  @ValidateNested({ each: true })
  @Type(() => SubProcessMasterCreateList)
  arraySubProcessMasters: SubProcessMasterCreateList[];

  
  
}


export class ProcessMasterCreateDto {
  @IsArray()
  @ApiProperty({type:[ProcessMasterCreateList]})
  @ValidateNested({ each: true })
  @Type(() => ProcessMasterCreateList)
  array: ProcessMasterCreateList[];

  
}



export class SubProcessMasterDeleteDto {
 
  @IsArray()
  @ApiProperty({ type: [String] })
  arraySubProcessMasterIdsForDelete: string[];

  
}
export class ProcessMasterEditDto {


  @IsString()
  @ApiProperty({})
  processMasterId: string;
 
  @IsString()
  @ApiProperty({})
  name: string;

  
  @IsNumber()
  @ApiProperty({})
  code: number;
  
  @IsNumber()
  @ApiProperty({})
  isAutomatic: number;

  @IsNumber()
  @ApiProperty({})
  maxHours: number;

  
  @IsString()
  @ApiProperty({})
  parentId: string;

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];

  @IsArray()
  @ApiProperty({ type: [String] })
  arraySubProcessMasterIdsForDelete: string[];

  @IsArray()
  @ApiProperty({type:[SubProcessMasterCreateList]})
  @ValidateNested({ each: true })
  @Type(() => SubProcessMasterCreateList)
  arraySubProcessMastersAdd: SubProcessMasterCreateList[];

  
  
}

export class ProcessMasterListDto {

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
  @ApiProperty({ type: [Number] })
  isAutomatic:number[];
  
  

  @IsArray()
  @ApiProperty({ type: [String] })
  processMasterIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  parentIds: string[];

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


export class ProcessMasterStatusChangeDto {


  @IsArray()
  @ApiProperty({ type: [String] })
  processMasterIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}
export class ListFilterLocadingProcessMasterDto {
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
export class CheckNameExistSubProcessDto {
  
  @IsString()
  @ApiProperty({})
  value: string;

  @IsString()
  @ApiProperty({})
  processMaster: string;

}
  