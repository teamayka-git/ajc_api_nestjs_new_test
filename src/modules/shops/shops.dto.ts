import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type, Type as ValidateTypes } from 'class-transformer';
import { Optional } from '@nestjs/common';

const descriptionStatus = '0-Inactive, 1-Active, 2-Delete';
const descriptionListScreenTypeForList =
  '0-total documents count, ,50-populate image global gallery,100-city detail';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';
const descriptionListGender = '0-male, 1-female, 2-other';
const descriptionListCommisionType =
  '0-Commision Percentage, 1-Commision amount';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType =
  '0-Created Date,1-Status  2-UID,  3-orderSaleRate, 4-stockSaleRate, 5-shopType, 6-billingModeSale, 7-billingModePurchase, 8-hallmarkingMandatoryStatus,9-creditAmount, 10-creditDays, 11-stonePricing, 12-agentCommision';
const descriptionListScreenTypeForFilterLoading =
  '0-total documents count, 50-globalGalleryImagePopulate only if user details exist, 100-branch populate, 101-orderHead populate, 102-relationship manager populate,  104-rate card populate, 106-city populate, 107-tds populate, 108-tcs populate, 109-ratebase master populate, 110-agent populate, 111-user details populate,112- rate card percentages if ratecard details exist, 113 - orderhead under[101] global gallery, 114 - relationship manager under[102] global gallery ,  115 - agent under[110] global gallery, 116 - freez rootcause details, 117 - freez user details, 118 - freezed user details under[117] global gallery details, 119 -  shop material stock balance                       ,200- general settings tax,201- general settings shop,202- general settings currency,203- general settings product,204- general settings order, 205-general settings invoice, 206-general settings other, 250-company details, 251 - online store theme manufacture data   ';
const descriptionListScreenTypeEmployeeCustomer =
  '0-total documents count, 50-globalGallery, 51- only customers,100- shop details,101- customer details';

const descriptionOrderSaleRate = '0 - unfix, 1 - fix';
const descriptionStockSaleRate = '0 - unfix, 1 - fix';
const descriptionShopType = '0-buisiness, 1-shop';
const descriptionBillingModeSale = '0-pure weight, 1-net weight, 2-job work';
const descriptionBillingModePurchase =
  '0-pure weight, 1-net weight, 2-job work';
const descriptionHallmarkingStatus = '0-No, 1-Yes';
const descriptionStonePricing = '0-automatic, 1-Manual';
const descriptionChatPermissions =
  '0-Allow voice message, 1-allow document uploading';
const descriptionCustomType = 'refer default module getUser api';
const descriptionCustomTypes = 'refer default module getUser api';
const descriptionCommisionType = '  0 - amount, 1 - percentage';
const descriptionTdsTcsStatus = '0-tds, 1-tcs';

export class ShopLoginDto {
  @IsString()
  @ApiProperty({})
  mobile: string;

  @IsString()
  @ApiProperty({})
  password: string;
}
class CustomerNewUsersCreateList {
  @IsString()
  @ApiProperty({})
  email: string;

  @IsString()
  @ApiProperty({})
  name: string;

  @IsNumber()
  @ApiProperty({})
  gender: number;

  @IsNumber()
  @ApiProperty({ description: descriptionCustomType })
  customType: number;

  @IsString()
  @ApiProperty({})
  mobile: string;

  @IsString()
  @ApiProperty({})
  field1: string;

  @IsString()
  @ApiProperty({})
  field2: string;

  @IsString()
  @ApiProperty({})
  field3: string;

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListDataGuard })
  dataGuard: number[];
}
class ShopNewUsersCreateList {
  @IsString()
  @ApiProperty({})
  email: string;

  @IsString()
  @ApiProperty({})
  name: string;

  @IsNumber()
  @ApiProperty({})
  gender: number;

  @IsNumber()
  @ApiProperty({ description: descriptionCustomType })
  customType: number;

  @IsString()
  @ApiProperty({})
  mobile: string;

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListDataGuard })
  dataGuard: number[];
}

class ShopExistingUsersList {
  @IsString()
  @ApiProperty({})
  userId: string;

  @IsNumber()
  @ApiProperty({ description: descriptionCustomType })
  customType: number;
}

export class ShopCreateDto {
  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListDataGuard })
  dataGuard: number[];
  ///////////////////////////////////////////////////////////////////////////////

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionOrderSaleRate })
  orderSaleRate: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionCommisionType })
  commisionType: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionStockSaleRate })
  stockSaleRate: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionShopType })
  shopType: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionTdsTcsStatus })
  tdsTcsStatus: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  isTaxIgstEnabled: number;

  @IsString()
  @ApiProperty({})
  branchId: string;
  @IsString()
  @ApiProperty({})
  name: string;

  @IsString()
  @ApiProperty({})
  displayName: string;

  @IsString()
  @ApiProperty({})
  orderHeadId: string;

  @IsString()
  @ApiProperty({})
  relationshipManagerId: string;

  @IsNumber()
  @ApiProperty({})
  isSupplier: number;

  @IsString()
  @ApiProperty({})
  panCardNumber: string;
  @IsString()
  @ApiProperty({})
  address: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionBillingModeSale })
  billingModeSale: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionBillingModePurchase })
  billingModePurchase: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionHallmarkingStatus })
  hallmarkingMandatoryStatus: number;

  @IsString()
  @ApiProperty({})
  rateCardId: string;

  @IsString()
  @ApiProperty({})
  gstNumber: string;

  @IsString()
  @ApiProperty({})
  cityId: string;

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

  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionChatPermissions })
  chatPermissions: number[];

  @IsString()
  @ApiProperty({})
  agentId: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  agentCommision: number;

  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [Number] })
  location: number[];

  @IsString()
  @ApiProperty({})
  email: string;

  @IsString()
  @ApiProperty({})
  mobile: string;

  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [ShopExistingUsersList] })
  @ValidateNested({ each: true })
  @Type(() => ShopExistingUsersList)
  arrayUserIdsEsixting: ShopExistingUsersList[];

  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [ShopNewUsersCreateList] })
  @ValidateNested({ each: true })
  @Type(() => ShopNewUsersCreateList)
  arrayUsersNew: ShopNewUsersCreateList[];
}

export class ShopEditeDto {
  @IsString()
  @ApiProperty({})
  shopId: string;
  @IsString()
  @ApiProperty({})
  name: string;

  @IsString()
  @ApiProperty({})
  shopUserId: string;

  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionListDataGuard })
  dataGuard: number[];
  ///////////////////////////////////////////////////////////////////////////////

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionOrderSaleRate })
  orderSaleRate: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionCommisionType })
  commisionType: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionStockSaleRate })
  stockSaleRate: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionShopType })
  shopType: number;

  @IsString()
  @ApiProperty({})
  branchId: string;
  @IsString()
  @ApiProperty({})
  address: string;

  @IsString()
  @ApiProperty({})
  displayName: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionTdsTcsStatus })
  tdsTcsStatus: number;

  @IsString()
  @ApiProperty({})
  orderHeadId: string;

  @IsString()
  @ApiProperty({})
  relationshipManagerId: string;

  @IsNumber()
  @ApiProperty({})
  isSupplier: number;

  @IsString()
  @ApiProperty({})
  panCardNumber: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionBillingModeSale })
  billingModeSale: number;
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionBillingModeSale })
  isTaxIgstEnabled: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionBillingModePurchase })
  billingModePurchase: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionHallmarkingStatus })
  hallmarkingMandatoryStatus: number;

  @IsString()
  @ApiProperty({})
  rateCardId: string;

  @IsString()
  @ApiProperty({})
  gstNumber: string;

  @IsString()
  @ApiProperty({})
  cityId: string;

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

  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionChatPermissions })
  chatPermissions: number[];

  @IsString()
  @ApiProperty({})
  agentId: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  agentCommision: number;

  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsObject()
  @ApiProperty({})
  location: Object;

  @IsString()
  @ApiProperty({})
  email: string;

  @IsString()
  @ApiProperty({})
  mobile: string;

  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [String] })
  arrayAddUserIdsEsixting: string[];

  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [String] })
  arrayRemoveUserIdsEsixting: string[];
  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [ShopNewUsersCreateList] })
  @ValidateNested({ each: true })
  @Type(() => ShopNewUsersCreateList)
  arrayUsersNew: ShopNewUsersCreateList[];
}

export class ShopStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  agentIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}

export class ListShopDto {
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number], description: descriptionStatus })
  statusArray: number[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionListScreenTypeForFilterLoading,
  })
  screenType: number[];

  @IsArray()
  @ApiProperty({ type: [Number] })
  responseFormat: number[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionCommisionType,
  })
  commisionType: number[];

  @IsNumber()
  @ApiProperty({})
  limit: number;

  @IsNumber()
  @ApiProperty({})
  skip: number;

  @IsNumber()
  @ApiProperty({ description: descriptionListSortType })
  sortType: number;
  @IsNumber()
  @ApiProperty({ description: descriptionListSortOrder })
  sortOrder: number;

  @IsString()
  @ApiProperty({})
  searchingText: string;

  @IsArray()
  @ApiProperty({ type: [String] })
  shopIds: string[];

  @IsArray()
  @ApiProperty({ type: [Number] })
  isSupplier: number[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionOrderSaleRate })
  orderSaleRates: number[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionStockSaleRate })
  stockSaleRates: number[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionShopType })
  shopTypes: number[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionBillingModeSale })
  billingModelSales: number[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionBillingModePurchase })
  billingModelPurchases: number[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionHallmarkingStatus })
  hallmarkingMandatoryStatuses: number[];

  @IsArray()
  @ApiProperty({ type: [String] })
  branchIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  orderHeadIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  relationshipManagerIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  rateCardIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  cityIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  tdsIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  tcsIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  ratebaseMasterIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  agentIds: string[];
}

export class CheckEmailExistDto {
  @IsString()
  @ApiProperty({})
  value: string;

  @IsArray()
  @ApiProperty({ type: [String] })
  existingIds: string[];
}
export class CheckMobileExistDto {
  @IsString()
  @ApiProperty({})
  value: string;

  @IsArray()
  @ApiProperty({ type: [String] })
  existingIds: string[];
}

export class ShopAddRemoveUsersDto {
  @IsString()
  @ApiProperty({})
  shopUserId: string;

  @IsArray()
  @ApiProperty({ type: [ShopExistingUsersList] })
  @ValidateNested({ each: true })
  @Type(() => ShopExistingUsersList)
  arrayUserIdsEsixting: ShopExistingUsersList[];

  @IsArray()
  @ApiProperty({ type: [String] })
  arrayRemoveUserIdsEsixting: string[];

  @IsArray()
  @ApiProperty({ type: [ShopNewUsersCreateList] })
  @ValidateNested({ each: true })
  @Type(() => ShopNewUsersCreateList)
  arrayUsersNew: ShopNewUsersCreateList[];
}

export class ShopAddRemoveCustomerDto {
  @IsString()
  @ApiProperty({})
  shopUserId: string;

  @IsArray()
  @ApiProperty({ type: [ShopExistingUsersList] })
  @ValidateNested({ each: true })
  @Type(() => ShopExistingUsersList)
  arrayUserIdsEsixting: ShopExistingUsersList[];

  @IsArray()
  @ApiProperty({ type: [String] })
  arrayRemoveUserIdsEsixting: string[];

  @IsArray()
  @ApiProperty({ type: [CustomerNewUsersCreateList] })
  @ValidateNested({ each: true })
  @Type(() => CustomerNewUsersCreateList)
  arrayUsersNew: CustomerNewUsersCreateList[];
}


export class MigrateCurrentShopToAcountLedgersDto {

  @IsNumber()
  @ApiProperty({})
  limit: number;

  
  @IsNumber()
  @ApiProperty({})
  skip: number;
  
  
}

export class ShopAcrossEmployeesAndCustomersDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  shopIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  customerIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  userIds: string[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionListScreenTypeEmployeeCustomer,
  })
  screenType: number[];

  @IsArray()
  @ApiProperty({ type: [Number] })
  responseFormat: number[];

  @IsNumber()
  @ApiProperty({})
  limit: number;

  @IsNumber()
  @ApiProperty({})
  skip: number;

  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number], description: descriptionStatus })
  statusArray: number[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionCustomTypes })
  customType: number[];

  @IsNumber()
  @ApiProperty({ description: descriptionListSortType })
  sortType: number;

  @IsNumber()
  @ApiProperty({ description: descriptionListSortOrder })
  sortOrder: number;

  @IsString()
  @ApiProperty({})
  searchingText: string;
}

export class ShopFreezStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  shopIds: string[];

  @IsNumber()
  @ApiProperty({})
  isFreezed: number;

  @IsString()
  @ApiProperty({})
  freezedDescription: string;

  
  @IsString()
  @ApiProperty({})
  freezedRootCauseName: string;

  @IsString()
  @ApiProperty({})
  freezedRootCause: string;
}

export class ShopThemeEditDto {
  @IsString()
  @ApiProperty({})
  shopId: string;

  @IsString()
  @ApiProperty({})
  splashText: string;

  @IsString()
  @ApiProperty({})
  splashBgColor: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  splashDuration: number;


  
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  isSplashImageRemoved: number;


  
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  isActionbarLogoImageRemoved: number;

  @IsString()
  @ApiProperty({})
  splashTextColor: string;

  @IsString()
  @ApiProperty({})
  actionbarBgColor: string;

  @IsString()
  @ApiProperty({})
  actionbarIconColor: string;

  @IsString()
  @ApiProperty({})
  actionbarTextColor: string;

  @IsString()
  @ApiProperty({})
  actionbarText: string;

  @IsString()
  @ApiProperty({})
  actionbarSearchBgColor: string;

  @IsString()
  @ApiProperty({})
  actionbarSearchHint: string;

  @IsString()
  @ApiProperty({})
  actionbarSearchHintColor: string;

  @IsString()
  @ApiProperty({})
  actionbarSearchIconColor: string;

  @IsString()
  @ApiProperty({})
  actionbarSearchTextColor: string;

  @IsString()
  @ApiProperty({})
  linearPbColor: string;

  @IsString()
  @ApiProperty({})
  roundedPbColor: string;
}
