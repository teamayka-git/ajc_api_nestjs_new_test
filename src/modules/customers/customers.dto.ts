import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type, Type as ValidateTypes } from 'class-transformer';
import { Optional } from '@nestjs/common';


const descriptionStatus="0-Inactive, 1-Active, 2-Delete";
const descriptionListScreenTypeForList="0-total documents count, ,50-populate image global gallery,100-city detail";
const descriptionListDataGuard="0-edit protect, 1-disabe protect, 2-delete protect";
const descriptionListGender="0-male, 1-female, 2-other";
const descriptionListCommisionType="0-Commision Percentage, 1-Commision amount";
const descriptionListSortOrder="1-ascending, -1-descending";
const descriptionListSortType="0-Created Date,1-Status  2-Name,3-commision type, 4-UID, 4-";
const descriptionListScreenTypeForFilterLoading="0-total documents count, 100-city details";

const descriptionOrderSaleRate="0 - unfix, 1 - fix";
const descriptionStockSaleRate="0 - unfix, 1 - fix";
const descriptionCustomerType="0-buisiness, 1-customer";
const descriptionBillingModeSale="0-pure weight, 1-net weight, 2-job work";
const descriptionBillingModePurchase="0-pure weight, 1-net weight, 2-job work";
const descriptionHallmarkingStatus="0-No, 1-Yes";
const descriptionStonePricing="0-automatic, 1-Manual";
const descriptionChatPermissions="0-Allow voice message, 1-allow document uploading";









export class CustomerLoginDto {
 
  @IsEmail()
  @ApiProperty({})
  email: string;

    @IsString()
    @ApiProperty({})
    password: string;
}


export class CustomerCreateDto {

  @IsString()
  @ApiProperty({})
  name: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({description:descriptionListGender})
  gender: number;


  @IsEmail()
  @ApiProperty({})
  email: string;

  @IsString()
  @ApiProperty({})
  password: string;

  @IsString()
  @ApiProperty({})
  mobile: string;

  @Transform(({ value }) =>typeof value == 'string' ? JSON.parse(value) : value    )
  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  ///////////////////////////////////////////////////////////////////////////////
  


  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({description:descriptionOrderSaleRate})
  orderSaleRate: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({description:descriptionStockSaleRate})
  stockSaleRate: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({description:descriptionCustomerType})
  customerType: number;

  @IsString()
  @ApiProperty({})
  branchId: string;

  @IsString()
  @ApiProperty({})
  orderHeadId: string;

  @IsString()
  @ApiProperty({})
  relationshipManagerId: string;

  @IsString()
  @ApiProperty({})
  supplierId: string;

  @IsString()
  @ApiProperty({})
  panCardNumber: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({description:descriptionBillingModeSale})
  billingModeSale: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({description:descriptionBillingModePurchase})
  billingModePurchase: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({description:descriptionHallmarkingStatus})
  hallmarkingMandatoryStatus: number;


  @IsString()
  @ApiProperty({})
  rateCardId: string;


  @IsString()
  @ApiProperty({})
  gstNumber: string;


  @IsString()
  @ApiProperty({})
  stateId: string;


  @IsString()
  @ApiProperty({})
  districtId: string;

  @IsString()
  @ApiProperty({})
  tdsId: string;

  @IsString()
  @ApiProperty({})
  tcsId: string;


  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  creditAmount: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  creditDays: number;

  @IsString()
  @ApiProperty({})
  rateBaseMasterId: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  stonePricing: number;


  @Transform(({ value }) =>typeof value == 'string' ? JSON.parse(value) : value    )
  @IsArray()
  @ApiProperty({ type: [Number], description:descriptionChatPermissions})
  chatPermissions:number[];

  @IsString()
  @ApiProperty({})
  agentId: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  agentCommision: number;






















}



export class CustomerEditeDto {

  @IsString()
  @ApiProperty({})
  customerId: string;
  @IsString()
  @ApiProperty({})
  name: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({description:descriptionListGender})
  gender: number;


  @IsString()
  @ApiProperty({})
  password: string;

  @IsString()
  @ApiProperty({})
  mobile: string;

  @Transform(({ value }) =>typeof value == 'string' ? JSON.parse(value) : value    )
  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionListDataGuard })
  dataGuard:number[];
  ///////////////////////////////////////////////////////////////////////////////
  


  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({description:descriptionOrderSaleRate})
  orderSaleRate: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({description:descriptionStockSaleRate})
  stockSaleRate: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({description:descriptionCustomerType})
  customerType: number;

  @IsString()
  @ApiProperty({})
  branchId: string;

  @IsString()
  @ApiProperty({})
  orderHeadId: string;

  @IsString()
  @ApiProperty({})
  relationshipManagerId: string;

  @IsString()
  @ApiProperty({})
  supplierId: string;

  @IsString()
  @ApiProperty({})
  panCardNumber: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({description:descriptionBillingModeSale})
  billingModeSale: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({description:descriptionBillingModePurchase})
  billingModePurchase: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({description:descriptionHallmarkingStatus})
  hallmarkingMandatoryStatus: number;


  @IsString()
  @ApiProperty({})
  rateCardId: string;


  @IsString()
  @ApiProperty({})
  gstNumber: string;


  @IsString()
  @ApiProperty({})
  stateId: string;


  @IsString()
  @ApiProperty({})
  districtId: string;

  @IsString()
  @ApiProperty({})
  tdsId: string;

  @IsString()
  @ApiProperty({})
  tcsId: string;


  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  creditAmount: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  creditDays: number;

  @IsString()
  @ApiProperty({})
  rateBaseMasterId: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  stonePricing: number;


  @Transform(({ value }) =>typeof value == 'string' ? JSON.parse(value) : value    )
  @IsArray()
  @ApiProperty({ type: [Number], description:descriptionChatPermissions})
  chatPermissions:number[];

  @IsString()
  @ApiProperty({})
  agentId: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  agentCommision: number;






















}


export class CustomerStatusChangeDto {


  @IsArray()
  @ApiProperty({ type: [String] })
  agentIds: string[];


  @IsNumber()
  @ApiProperty({description:descriptionStatus})
  status: number;

}

export class ListFilterLocadingCustomersDto {
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