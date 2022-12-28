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

const descriptionStatus = '0-Inactive, 1-Active, 2-Delete';
const descriptionListScreenTypeForList = '0-total documents count, 100- change request new images documents,101- change request new images documents under[100] global gallery, 102- change request delete images documents,103- change request delete images documents under[102] global gallery,';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType = '0-Created Date, 1-Status,2-Is Puchase Generated';


const descriptionListType = ' 0 - cancel request, 1 - amendment request';
const descriptionListWorkStatus = ' 0 - pending, 1 - accept, 2 - reject';
const descriptionListProceedStatus = ' -1 - nothing, 0 - cancel order if not possible, 1 - cancel order if not possible';
const descriptionFileOriginalName =
  "file name givent while uploading, if there is no image then give 'nil; here";
  const descriptionListDocType = '0-image, 1-video, 2-pdf, 3-audio, 4-document';

class orderSaleChangeRequestList {
  @IsString()
  @ApiProperty({ description: descriptionFileOriginalName })
  fileOriginalName: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionListDocType })
  docType: number;
}

  
export class OrderSaleChangeRequestCreateDto {
  @IsString()
    @ApiProperty({})
    orderSaleId: string;

    @IsString()
    @ApiProperty({})
    rootCauseId: string;
  
    @IsString()
    @ApiProperty({})
    description: string;
  
    @Transform(({ value }) => Number(value))
    @IsNumber()
    @ApiProperty({description:descriptionListType})
    type: number;
  
    @Transform(({ value }) => Number(value))
    @IsNumber()
    @ApiProperty({})
    isMistakeWithManufactor: number;
  
    @Transform(({ value }) => Number(value))
    @IsNumber()
    @ApiProperty({description:descriptionListProceedStatus})
    proceedStatus: number;
  
    @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
    @IsArray()
    @ApiProperty({ type: [String] })
    deleteImageGlobalGalleryIds: string[];
  
    @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [orderSaleChangeRequestList] })
  @ValidateNested({ each: true })
  @Type(() => orderSaleChangeRequestList)
  arrayDocuments: orderSaleChangeRequestList[];
    
}


export class OrderSaleChangeRequestListDto {
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
    description: descriptionListScreenTypeForList,
  })
  screenType: number[];


  @IsArray()
  @ApiProperty({ type: [Number], })
  responseFormat: number[];
  
  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleChangeRequestIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleIds: string[];

  
  @IsArray()
  @ApiProperty({ type: [String] })
  uids: string[];




  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListType })
  types: number[];
  

  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListWorkStatus })
  workStatus: number[];
  
  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListProceedStatus })
  proceedStatus: number[];
  
  @IsArray()
  @ApiProperty({ type: [Number], })
  isMistakeWithManufactor: number[];
  
  
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

export class OrderSaleChangeRequestStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  OrderSaleChangeRequestIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}
