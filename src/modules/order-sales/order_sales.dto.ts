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
  '0-total documents count,100-populate sub categories, 101-list documents, 102-customer id, 103-root cause populate, 104-order sale histories, 105-set process, 106-setprocess and sub process also, 107-workers list and department list';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';

const descriptionStatus = '0-Inactive, 1-Active, 2-Delete';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType =
  '0-Created Date, 1-Status,2-due date, 3-is rhodium, 4-quantity, 5-size, 6-weight';
const descriptionListDocType = '0-image, 1-video, 2-pdf, 3-audio, 4-document';

const descriptionFileOriginalName =
  "file name givent while uploading, if there is no image then give 'nil; here";

const descriptionWorkStatus="0-pending, 1-accepted, 2-rejected";
const descriptionListScreenTypeForSetProcessOrdersaleList ='0-total count,100-order details,101-process and sub process details  500-order list assigned by me';

const DescriptionOrderSaleProcessOrderStatus="0-Pending, 1-Assigned, 2-On Working, 3-Completed, 4-Hold, Request To Assign";

class orderSaleCreateList {
  @IsString()
  @ApiProperty({ description: descriptionFileOriginalName })
  fileOriginalName: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionListDocType })
  docType: number;
}

export class OrderSalesCreateDto {
  @IsString()
  @ApiProperty({})
  subCategoryId: string;

  @IsString()
  @ApiProperty({})
  customerId: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  quantity: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  size: number;
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  weight: number;

  @IsString()
  @ApiProperty({})
  stoneColor: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  dueDate: number;

  @IsString()
  @ApiProperty({})
  description: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  isRhodium: number;
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  isMatFinish: number;

  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [orderSaleCreateList] })
  @ValidateNested({ each: true })
  @Type(() => orderSaleCreateList)
  arrayDocuments: orderSaleCreateList[];
}

class orderSaleEditList {
  @IsString()
  @ApiProperty({ description: descriptionFileOriginalName })
  fileOriginalName: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionListDocType })
  docType: number;
}

export class OrderSalesEditDto {
  @IsString()
  @ApiProperty({})
  orderSaleId: string;

  @IsString()
  @ApiProperty({})
  subCategoryId: string;


  @IsString()
  @ApiProperty({})
  customerId: string;

  
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  quantity: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  size: number;
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  weight: number;

  @IsString()
  @ApiProperty({})
  stoneColor: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  dueDate: number;

  @IsString()
  @ApiProperty({})
  description: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  isRhodium: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  isMatFinish: number;


  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [String] })
  documentsLinkingIdsForDelete: string[];

  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [orderSaleEditList] })
  @ValidateNested({ each: true })
  @Type(() => orderSaleEditList)
  arrayDocuments: orderSaleEditList[];
}

export class OrderSaleListDto {
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
  @ApiProperty({ type: [String] })
  orderSaleIdsIds: string[];

  @IsNumber()
  @ApiProperty({})
  limit: number;

  @IsNumber()
  @ApiProperty({})
  skip: number;

  @IsString()
  @ApiProperty({})
  searchingText: string;

  @IsArray()
  @ApiProperty({ type: [String] })
  subCategoryIds: string[];

  @IsNumber()
  @ApiProperty({})
  dueStartDate: number;

  @IsNumber()
  @ApiProperty({})
  dueEndDate: number;

  @IsArray()
  @ApiProperty({ type: [String] })
  salesPersonIds: string[];
  
  @IsArray()
  @ApiProperty({ type: [String] })
  customerIds: string[];

  @IsArray()
  @ApiProperty({ type: [Number] })
  isRhodium: number[];


  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionWorkStatus })
  workStatus: number[];


  @IsArray()
  @ApiProperty({ type: [Number] })
  isMatFinish: number[];
}

export class OrderSalesChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}
export class OrderSalesWorkStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionWorkStatus })
  workStatus: number;

  @IsString()
  @ApiProperty({  })
  rootCause:string;
  @IsString()
  @ApiProperty({  })
  rootCauseId: string;


}
export class SetProcessAssignedOrderSaleListDto {


  
  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionListScreenTypeForSetProcessOrdersaleList,
  })
  screenType: number[];

  @IsArray()
  @ApiProperty({ type: [String] })
  employeesArray: string[];
  @IsArray()
  @ApiProperty({ type: [String] })
  idsArray: string[];

  @IsArray()
  @ApiProperty({ type: [Number],description:DescriptionOrderSaleProcessOrderStatus })
  workStatusArray: number[];

  
  

}
