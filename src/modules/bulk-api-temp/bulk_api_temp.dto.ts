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


class StateBulkDataList {
 
  @IsString()
  @ApiProperty({})
  Name: string;

  @IsString()
  @ApiProperty({})
  Code: string;

}

export class StateBulkDataDto {
 
  @IsArray()
  @ApiProperty({ type: [StateBulkDataList] })
  @ValidateNested({ each: true })
  @Type(() => StateBulkDataList)
  items: StateBulkDataList[];
}

class DistrictBulkDataList {

  @IsString()
  @ApiProperty({})
  Name: string;
 
  @IsString()
  @ApiProperty({})
  Code: string;
 
  @IsString()
  @ApiProperty({})
  State: string;
 
 }
 
 export class DistrictBulkDataDto {
 
  @IsArray()
  @ApiProperty({ type: [DistrictBulkDataList] })
  @ValidateNested({ each: true })
  @Type(() => DistrictBulkDataList)
  items: DistrictBulkDataList[];
 }
 class CityBulkDataList {
 
  @IsString()
  @ApiProperty({})
  Name: string;
 
  @IsString()
  @ApiProperty({})
  Code: string;
 
  @IsString()
  @ApiProperty({})
  District: string;
 
 }
 
 export class CityBulkDataDto {
 
  @IsArray()
  @ApiProperty({ type: [CityBulkDataList] })
  @ValidateNested({ each: true })
  @Type(() => CityBulkDataList)
  items: CityBulkDataList[];
 }
 class BranchBulkDataList {
 
  @IsString()
  @ApiProperty({})
  Name: string;
 
  @IsString()
  @ApiProperty({})
  Code: string;
 
  @IsString()
  @ApiProperty({})
  Email: string;

  @IsString()
  @ApiProperty({})
  Mobile: string;
 
 }
 
 export class BranchBulkDataDto {
 
  @IsArray()
  @ApiProperty({ type: [BranchBulkDataList] })
  @ValidateNested({ each: true })
  @Type(() => BranchBulkDataList)
  items: BranchBulkDataList[];
 }

 class DepartmentBulkDataList {
 
  @IsString()
  @ApiProperty({})
  Name: string;
 
  @IsString()
  @ApiProperty({})
  Code: string;
 
  @IsString()
  @ApiProperty({})
  Prefix: string;

 
 }
 
 export class DepartmentBulkDataDto {
 
  @IsArray()
  @ApiProperty({ type: [DepartmentBulkDataList] })
  @ValidateNested({ each: true })
  @Type(() => DepartmentBulkDataList)
  items: DepartmentBulkDataList[];
 }
 class EmployeesBulkDataList {
 
  @IsString()
  @ApiProperty({})
  Name: string;
 
  @IsString()
  @ApiProperty({})
  Gender: string;
 
  @IsString()
  @ApiProperty({})
  Email: string;

  @IsString()
  @ApiProperty({})
  Mobile: string;

  @IsString()
  @ApiProperty({})
  Departments: string;

  @IsString()
  @ApiProperty({})
  Prefix: string;

 
 }
 
 export class EmployeesBulkDataDto {
 
  @IsArray()
  @ApiProperty({ type: [EmployeesBulkDataList] })
  @ValidateNested({ each: true })
  @Type(() => EmployeesBulkDataList)
  items: EmployeesBulkDataList[];
 }

 class RatecardBulkDataList {
 
  @IsString()
  @ApiProperty({})
  Name: string;

  @IsString()
  @ApiProperty({})
  type: string;



  @IsString()
  @ApiProperty({})
  Percentage: string;
 
 
  
 
 }
 
 export class RatecardBulkDataDto {
 

  @IsString()
  @ApiProperty({description:"For all ratecatd items this will be sub category"})
  subCategoryId: string;
 


  @IsArray()
  @ApiProperty({ type: [RatecardBulkDataList] })
  @ValidateNested({ each: true })
  @Type(() => RatecardBulkDataList)
  items: RatecardBulkDataList[];
 }
 class RatebaseMasterRatecardBulkDataList {
 
  @IsString()
  @ApiProperty({})
  Name: string;
 
  
  
 
 }
 
 export class RatebaseMasterBulkDataDto {
 
  @IsArray()
  @ApiProperty({ type: [RatebaseMasterRatecardBulkDataList] })
  @ValidateNested({ each: true })
  @Type(() => RatebaseMasterRatecardBulkDataList)
  items: RatebaseMasterRatecardBulkDataList[];
 }
 
 class TdsTcsBulkDataList {
 
  @IsString()
  @ApiProperty({})
  Percentage: string;
 
  
  
 
 }
 
 export class TdsTcsMasterBulkDataDto {
 
  @IsArray()
  @ApiProperty({ type: [TdsTcsBulkDataList] })
  @ValidateNested({ each: true })
  @Type(() => TdsTcsBulkDataList)
  items: TdsTcsBulkDataList[];
 }


 
 class shopBulkDataList {
 
  @IsString()
  @ApiProperty({})
  LEGAL_NAME: string;
 
  @IsString()
  @ApiProperty({})
  DISPLAY_NAME: string;
 
  @IsString()
  @ApiProperty({})
  Email: string;
 
  @IsString()
  @ApiProperty({})
  Mobile: string;
 
  @IsString()
  @ApiProperty({})
  Address: string;
 
  @IsString()
  @ApiProperty({})
  Shop_Type: string;
 
  @IsString()
  @ApiProperty({})
  City: string;
 
  @IsString()
  @ApiProperty({})
  Branch: string;
 
  @IsString()
  @ApiProperty({})
  Is_Supplier: string;
 
  @IsString()
  @ApiProperty({})
  Agent: string;
 
  @IsString()
  @ApiProperty({})
  Order_head: string;
 
  @IsString()
  @ApiProperty({})
  Relationship_manager: string;
 
  @IsString()
  @ApiProperty({})
  RateCard: string;
 
  @IsString()
  @ApiProperty({})
  Rate_Base: string;
 
  @IsString()
  @ApiProperty({})
  TDS_TCS: string;
 
  @IsString()
  @ApiProperty({})
  TDS_TCS_Value: string;
 
  @IsString()
  @ApiProperty({})
  Commision_Type: string;
 
  @IsString()
  @ApiProperty({})
  Commision_Value: string;
 
  @IsString()
  @ApiProperty({})
  PanCard_Number: string;
 
  @IsString()
  @ApiProperty({})
  GST_Number: string;
 
  @IsString()
  @ApiProperty({})
  Credit_Amount: string;
 
  @IsString()
  @ApiProperty({})
  Credit_Days: string;
 
  @IsString()
  @ApiProperty({})
  Stone_Pricing: string;
 
  @IsString()
  @ApiProperty({})
  OrderSale_Rate: string;
 
  @IsString()
  @ApiProperty({})
  Stoc_Sale_Rate: string;
 
  @IsString()
  @ApiProperty({})
  Billing_Model_Sales: string;
 
  @IsString()
  @ApiProperty({})
  Billing_Mode_Purchase: string;
 
  @IsString()
  @ApiProperty({})
  Hallmarking_Mandatory_Status: string;
 
  @IsString()
  @ApiProperty({})
  Chat_Permission: string;
 
  @IsString()
  @ApiProperty({})
  User_Name: string;
 
  @IsString()
  @ApiProperty({})
  User_Email: string;
 
  @IsString()
  @ApiProperty({})
  User_mobile: string;
 
  @IsString()
  @ApiProperty({})
  User_Gender: string;
 
  
  
 
 }
export class ShopBulkDataDto {
  
  @IsArray()
  @ApiProperty({ type: [shopBulkDataList] })
  @ValidateNested({ each: true })
  @Type(() => shopBulkDataList)
  items: shopBulkDataList[];

  @IsNumber()
  @ApiProperty({description:"for all document give this value ",default:1  })
  tdsTcsValue: number;
  

  @IsString()
  @ApiProperty({description:"for all document this value will give to tcs"})
  tcsIdAlways: string;
}
