import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNumber,
  isNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type, Type as ValidateTypes } from 'class-transformer';
import { Optional } from '@nestjs/common';

const descriptionStatus = '0-Inactive, 1-Active, 2-Delete';
const descriptionListScreenTypeForList =
  '0-total documents count,100-shop, 101-order item Details, 102-subCategoryDetails, 103-CategoryDetails, 104-groupDetails, 105-stone linking, 106-product documents, 107- shop under[100] global gallery, 108 - products documents under[106] global gallery, 109 - stone list under[105] stone details, 110 - stone list under[105] stone details under[109] global gallery, 111 - stone list under[105] colour master details, 112- order sale item details under[101] ordersale main details, 113- order sale item details under[101] ordersale main details under[112] order sale documents, 114- order sale item details under[101] ordersale main details under[112] order sale documents under[113] global gallery details, 115-product tag linking list, 116 - product tag linking under[115] tag master details, 117 - product tag linking under[115] tag master details under[116] documents list, 118 - product tag linking under[115] tag master details under[116] documents list under[117] global gallery details, 118 - designer id details ';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType =
  '0-Created Date, 1-Status,2-Name, 3-designerId, 4-grossWeight, 5-type, 6-purity, 7-hmSealing, 8-huid, 9-eCommerceStatus';
  const descriptionType = ' 0 - from order sale, 1 - from stock order(from e store select design then), 2 - stock product(variant in estore), 3 - design';
  const descriptionStockStatus = '0 - out stock,  1 - in stock,  2 - hold';

const descriptionListDocType = '0-image, 1-video, 2-pdf, 3-audio, 4-document';

const descriptionFileOriginalName =
  "file name givent while uploading, if there is no image then give 'nil; here";

class StonesList {
  @IsString()
  @ApiProperty({})
  stoneId: string;

  @IsString()
  @ApiProperty({})
  colourId: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  stoneWeight: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  stoneAmount: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  quantity: number;
}


class productDocumentCreateList {
  @IsString()
  @ApiProperty({ description: descriptionFileOriginalName })
  fileOriginalName: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionListDocType })
  docType: number;

}
class ProductCreateList {

  @IsString()
  @ApiProperty({})
  name: string;


  @Transform(({ value }) =>
  typeof value == 'string' ? JSON.parse(value) : value,
)
  @IsArray()
  @ApiProperty({ type: [String] })
  moldNumber: string[];


  @IsString()
  @ApiProperty({})
  designId: string;


  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  isStone: number;


  @IsString()
  @ApiProperty({})
  orderItemId: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  grossWeight: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  hmSealingStatus: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  eCommerceStatus: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  totalStoneWeight: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  totalStoneAmount: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  netWeight: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionType })
  type: number;

  @IsString()
  @ApiProperty({})
  subCategoryId: string;


  @Transform(({ value }) =>
  typeof value == 'string' ? JSON.parse(value) : value,
)
  @IsArray()
  @ApiProperty({ type: [String] })
  tagIds: string[];




  @Transform(({ value }) =>
  typeof value == 'string' ? JSON.parse(value) : value,
)
  @IsArray()
  @ApiProperty({ type: [StonesList] })
  @ValidateNested({ each: true })
  @Type(() => StonesList)
  stonesArray: StonesList[];


  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [productDocumentCreateList] })
  @ValidateNested({ each: true })
  @Type(() => productDocumentCreateList)
  arrayDocuments: productDocumentCreateList[];

}

export class ProductCreateDto {



  @IsString()
  @ApiProperty({})
  shopId: string;

  @IsString()
  @ApiProperty({})
  orderId: string;

  @Transform(({ value }) =>
  typeof value == 'string' ? JSON.parse(value) : value,
)
  @IsArray()
  @ApiProperty({ type: [ProductCreateList] })
  @ValidateNested({ each: true })
  @Type(() => ProductCreateList)
  arrayItems: ProductCreateList[];
}

export class ProductEditDto {

  @IsString()
  @ApiProperty({})
  productId: string;

  @IsString()
  @ApiProperty({})
  name: string;

  @IsString()
  @ApiProperty({})
  orderId: string;



  @Transform(({ value }) =>
  typeof value == 'string' ? JSON.parse(value) : value,
)
  @IsArray()
  @ApiProperty({ type: [String] })
  moldNumber: string[];


  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  isStone: number;


  // @IsString()
  // @ApiProperty({})
  // orderItemId: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  grossWeight: number;

  // @Transform(({ value }) => Number(value))
  // @IsNumber()
  // @ApiProperty({})
  // hmSealingStatus: number;

//   @Transform(({ value }) => Number(value))
//   @IsNumber()
//   @ApiProperty({})
//   eCommerceStatus: number;

@Transform(({ value }) => Number(value))
@IsNumber()
@ApiProperty({})
totalStoneWeight: number;

@Transform(({ value }) => Number(value))
@IsNumber()
@ApiProperty({})
totalStoneAmount: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  netWeight: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionType })
  type: number;

  @IsString()
  @ApiProperty({})
  subCategoryId: string;


  @Transform(({ value }) =>
  typeof value == 'string' ? JSON.parse(value) : value,
)
  @IsArray()
  @ApiProperty({ type: [String] })
  tagIds: string[];


  @Transform(({ value }) =>
  typeof value == 'string' ? JSON.parse(value) : value,
)
  @IsArray()
  @ApiProperty({ type: [String] })
  documentRemoveLinkingIds: string[];

  @Transform(({ value }) =>
  typeof value == 'string' ? JSON.parse(value) : value,
)
  @IsArray()
  @ApiProperty({ type: [String] })
  stoneRemoveLinkingIds: string[];

  @Transform(({ value }) =>
  typeof value == 'string' ? JSON.parse(value) : value,
)
  @IsArray()
  @ApiProperty({ type: [String] })
  tagRemoveLinkingIds: string[];




  @Transform(({ value }) =>
  typeof value == 'string' ? JSON.parse(value) : value,
)
  @IsArray()
  @ApiProperty({ type: [StonesList] })
  @ValidateNested({ each: true })
  @Type(() => StonesList)
  stonesArray: StonesList[];


  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [productDocumentCreateList] })
  @ValidateNested({ each: true })
  @Type(() => productDocumentCreateList)
  arrayDocuments: productDocumentCreateList[];

}
export class ProductListDto {
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
  @ApiProperty({ type: [String] })
  relationshipManagerIds: string[];

  
  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleUids: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  orderHeadIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  shopIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  cityIds: string[];


  @IsArray()
  @ApiProperty({ type: [Number], })
  responseFormat: number[];
  
  @IsArray()
  @ApiProperty({ type: [String] })
  productIds: string[];

  

  @IsArray()
  @ApiProperty({ type: [String] })
  orderIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  barcodes: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  subCategoryIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  categoryIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  groupIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  huId: string[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionListScreenTypeForList,
  })
  type: number[];

  
  @IsOptional()
  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionStockStatus,
  })
  stockStatus: number[];

  @IsArray()
  @ApiProperty({
    type: [Number],
  })
  isStone: number[];

  @IsArray()
  @ApiProperty({
    type: [Number],
  })
  eCommerceStatuses: number[];
  @IsArray()
  @ApiProperty({
    type: [Number],
  })
  hmStealingStatus: number[];

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

export class ProductEcommerceStatusChangeDto {
  @IsNumber()
  @ApiProperty({})
  eCommerceStatus: number;

  @IsArray()
  @ApiProperty({ type: [String] })
  productIds: string[];
}
export class GetBulkProductBarcodeDto {
  @IsNumber()
  @ApiProperty({})
  count: number;

  
}
export class GetProductWithBarcodeDto {

  @IsString()
  @ApiProperty({})
  barcode: string;

  
  @IsArray()
  @ApiProperty({
    type: [Number],description:descriptionStockStatus
  })
  stockStatus: number[];

  
  @IsArray()
  @ApiProperty({
    type: [Number],description:descriptionType
  })
  type: number[];

  
}
export class StockFromProductTempDto {
 
@IsArray()
@ApiProperty({ type: [String] })
productTempIds: string[];

}
