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
  '0-total documents count, 100 - process masters extra, 101-list documents, 102-shop id, 103-root cause populate, 104-order sale histories, 105-set process, 107-workers list extra, 108 - set process under[105] process master, 109 - set process under[105] user, 110 - set process under[105] set sub process,111 - set process under[105] sub process under[110] sub process master,112 - set process under[105] sub process under[110] user populate,113 - set process under[105] sub process under[110] user under global gallery, 114 - order sale history under[104] user details, 115 - order sale history under[104] user details under[114] global gallery, 116 - order sale history under[104] created user details ,117 - order sale history under[104] created user details under[116] global gallery, 118- order sale document under[101] global galleryu populate, 119 - shop under[102] global gallery details, 120 -  order head details, 121 -  order head under[120] global gallery, 122 - shop under[102] relationship manager details,123 - shop under[102] relationship manager under[122] global gallery , 124 - order sale list sales order items ,125 - order sale items list under[124] product details,126 - order sale items list under[124] design details, 127 -  order sale items list under[124] sub category, 128 -  order sale items list under[124] sub category under[127] category details, 129 -  order sale items list under[124] sub category under[127] category under[128] group details, 133 -order sale histories under[104] delivery provider details, 134 - order sale items list under[124] invoice items, 135 - order sale items list under[124] invoice items under[134] invoice details,  136 - order sale items list under[124] invoice items under[134] invoice details under[135] delivery items,  137 - order sale items list under[124] invoice items under[134] invoice details under[135] delivery items under[136] delivery details, 138 - order sale items list under[124] item documents, 139 - order sale items list under[124] item documents under[138] global gallery details, 140 - set process under[105] set process document list, 141 - set process under[105] set process document list [140] under global gallery details, 142 - order hold rootcause ,143 - order amendment requests, 144-change request pending list, 145 - internal rework root cause details ,     500 - sub categori list extra, 501 - general settings due date days count extra, 502 - employee app latest version, 503 - customer app latest version, 504-delivery reject root cause, 505 - shop data extra, 506-customer dashboard datas, 507 - online store theme manufacture data ';

const descriptionListScreenTypeOrderSaleReport =
  '0-total documents count, 100 - process masters extra, 101-list documents, 102-shop id, 103-root cause populate, 104-order sale histories, 105-set process, 107-workers list extra, 108 - set process under[105] process master, 109 - set process under[105] user, 110 - set process under[105] set sub process,111 - set process under[105] sub process under[110] sub process master,112 - set process under[105] sub process under[110] user populate,113 - set process under[105] sub process under[110] user under global gallery, 114 - order sale history under[104] user details, 115 - order sale history under[104] user details under[114] global gallery, 116 - order sale history under[104] created user details ,117 - order sale history under[104] created user details under[116] global gallery, 118- order sale document under[101] global galleryu populate, 119 - shop under[102] global gallery details, 120 -  order head details, 121 - order head under[120] global gallery, 122 - shop under[102] relationship manager details,123 - shop under[102] relationship manager under[122] global gallery , 124 - order sale list sales order items ,125 - order sale items list under[124] product details,126 - order sale items list under[124] design details, 127 -  order sale items list under[124] sub category, 128 -  order sale items list under[124] sub category under[127] category details, 129 -  order sale items list under[124] sub category under[127] category under[128] group details, 130 - shop under[102] branch details, 131 - order sale items list under[124] invoice items, 132 - order sale items list under[124] invoice items under[131] invoice details, , 133 -order sale histories under[104] delivery provider details, 134 -shop under[102] city details    500 - sub categori list extra, 501 - general settings due date days count extra';
const descriptionScreenTypeGetWorkCount = '100-worker, 101-OH';
const descriptionListDataGuard =
  '0-edit protect, 1-disabe protect, 2-delete protect';

const descriptionStatus = '0-Inactive, 1-Active, 2-Delete';
const descriptionListSortOrder = '1-ascending, -1-descending';
const descriptionListSortType = '0-Created Date, 1-Status,2-due date';
const descriptionListDocType = '0-image, 1-video, 2-pdf, 3-audio, 4-document';
const descriptionGlobalSearchType =
  '0-Order, 1-shop, 2-Invoice, 3-orderhead, 4-shop phone, 5-net weight';

const descriptionSetProcessListSortOrder = '1-ascending, -1-descending';
const descriptionSetProcessListSortType = '0-Created Date, 1-Status,2-due date';

const descriptionGLobalGalleryIds =
  'this is for while stocksale add design documents to order documents';
const descriptionScreenTypeGlobalSearch =
  '0 - total documents count, 100 - ordersale items, 101 - ordersale documents, 102 - ordersale documents under[101] global gallery details, 103 - shop details, 104-ordersale items under [100] product details, 105 - set process,106 - set process under[105] process master, 107 - ordersale items under [100] sub category details ';
const descriptionScreenTypeQrBardodeOrderDetails =
  '0 - total documents count, 100 - ordersale items, 101 - ordersale documents, 102 - ordersale documents under[101] global gallery details, 103 - shop details, 104-ordersale items under [100] product details, 105 - set process,106 - set process under[105] process master, 107 - ordersale items under [100] sub category details ';

const descriptionFileOriginalName =
  "file name givent while uploading, if there is no image then give 'nil; here";

const descriptionWorkStatus = '0-pending, 1-accepted, 2-rejected';
const descriptionListScreenTypeForSetProcessOrdersaleList =
  '0-total count,100-order details,101-set sub process list, 102-process master  500-order list assigned by me, 103 - set sub process under[101] sub processmaster, 104 - order sale main under[100] shop details, 105 - order sale main under[100] documents details, 106 - order sale main under[100] documents under global gallery details, 107 - order sale main under[100] items list, 108 - order sale main under[100] items list under[107] sub category details , 109 - order sale main under[100] shop details under[104] global gallery, 111 - order sale main under[100] shop details under[104] Orderhead details, 112 - order sale main under[100] shop details under[104] Orderhead details under[111] global gallery, 113 - order sale main under[100] shop details under[104] Relationship manager details, 114 -  order sale main under[100] shop details under[104] relationship manager details under[113] global gallery, 115 - order sale completed set process list, 116 - order sale completed set process list under[115] process master details, 117 - order sale completed set process list under[115] process notes documents list, 118 - order sale completed set process list under[115] process notes documents list under[117] global gallery details, 119 - order sale items under[107] documents,120 - order sale items under[107] documents under[119] global gallery, 121 - os item under[107] design populate,, 122 - order sale main under[100] hold root cause details, 123 - order sale main under[100] order head details, 124 - order sale main under[100] order head details under[123] global gallery ';

const DescriptionOrderSaleProcessOrderStatus =
  '0-Pending, 1-Assigned, 2-On Working, 3-Completed, 4-Hold, Request To Assign';
const DescriptionOrderSalesHistoriesType =
  '  0 - order pending  1 - order accept  2 - order reject  3 - set process done  4 - finished goods  5 - product generate request  6 - product generated   7 - deliverychalan generated//need to discuss  8 - halmark issuence requested  9 - halmark issuence bypassed  10 - send to halmark issuence  11 - halmarking issued  12 - halmark request cancelled  13 - halmark request rejected  14 - halmark error occured  15 - send to reissuence   16 - invoice pending  17 - invoice generated  18 - outof delivery pending  19 - hub transfer pending  20 - delivery job assigned  21 - delivery in transit  22 - delivered to customer            23 - delivey accepted  24 - order declined collection pending   25 - order declined collected  26 - order declined inscan  27 - order cancelled  28 - delivery reshedule requested  29 - hub tranfer pending  30 - hub assigned  31 - hub tranfer intransit  32 - hub transfer delivered  33 - hub transfer accepted    100 - order editted  101- sales order actived  102- sales order disabled  103- sales order deleted  104- sales order general remark editted';
const descriptionType = ' 0 - order sale(custom order), 1 - stock sale(from e store), 2 - sales on approval(from delivery boy), 3 - counter sale(bill from manufactor) ';
const descriptionDeliveryType =
  ' 0 - bundle delivery,1 - get me the ready item first';
const descriptionStockStatus = '0 - out of stock, 1 - in stock';
const descriptionSetProcessOrderStatus =
  'inside ordersale list set process filter with this array if this arrayu not empty';

class orderSaleCreateList {
  @IsString()
  @ApiProperty({ description: descriptionFileOriginalName })
  fileOriginalName: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionListDocType })
  docType: number;
}
class orderSaleItemsCreateList {
  @IsOptional()
  @IsString()
  @ApiProperty({})
  productId: string;

  @IsOptional()
  @IsString()
  @ApiProperty({})
  designId: string;

  @IsString()
  @ApiProperty({})
  subCategoryId: string;

  @IsString()
  @ApiProperty({})
  quantity: string;

  @IsString()
  @ApiProperty({})
  size: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionStockStatus })
  stockStatus: number;

  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsOptional()
  @IsArray()
  @ApiProperty({ type: [String], description: descriptionGLobalGalleryIds })
  globalGalleryIds: string[];

  @IsString()
  @ApiProperty({})
  weight: number;

  @IsString()
  @ApiProperty({})
  stoneColor: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  isRhodium: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  isMatFinish: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  isDullFinish: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  isEnamel: number;
}

export class OrderSalesCreateDto {
  @IsString()
  @ApiProperty({})
  shopId: string;

  @IsString()
  @ApiProperty({})
  referenceNumber: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionType })
  type: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  dueDate: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionDeliveryType })
  deliveryType: number;

  @IsString()
  @ApiProperty({})
  description: string;

  @IsOptional()
  @IsString()
  @ApiProperty({})
  generalRemark: string;




  @IsOptional()
  @IsString()
  @ApiProperty({})
  otpId: string;

  @IsOptional()
  @IsString()
  @ApiProperty({})
  otpValue: string;


  @IsOptional()
  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [String] })
  employeeStockInHandItemIds: string[];


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
  @ApiProperty({ type: [orderSaleItemsCreateList] })
  @ValidateNested({ each: true })
  @Type(() => orderSaleItemsCreateList)
  arrayItems: orderSaleItemsCreateList[];
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
class orderSaleItemEditList {
  @IsString()
  @ApiProperty({})
  orderSaleItemId: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  isDullFinish: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  isEnamel: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  isRhodium: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  isMatFinish: number;

  @IsString()
  @ApiProperty({})
  subCategoryId: string;

  @IsString()
  @ApiProperty({})
  quantity: string;

  @IsString()
  @ApiProperty({})
  size: string;

  @IsString()
  @ApiProperty({})
  weight: number;

  @IsString()
  @ApiProperty({})
  stoneColor: string;
}

export class OrderSalesEditDto {
  @IsString()
  @ApiProperty({})
  orderSaleId: string;

  @IsString()
  @ApiProperty({})
  ordderSaleHistoryDescription: string;

  @IsString()
  @ApiProperty({})
  shopId: string;

  @IsString()
  @ApiProperty({})
  referenceNumber: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ description: descriptionType })
  type: number;


  @IsOptional()
  @IsString()
  @ApiProperty({})
  amendmentRequestId: string;



  @IsOptional()
  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsObject()
  @ApiProperty({})
  amendmentObject: Object;

@IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  doReworkAmendment: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({})
  dueDate: number;

  @IsOptional()
  @IsString()
  @ApiProperty({})
  generalRemark: string;

  @IsString()
  @ApiProperty({})
  description: string;

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

  @Transform(({ value }) =>
    typeof value == 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @ApiProperty({ type: [orderSaleItemEditList] })
  @ValidateNested({ each: true })
  @Type(() => orderSaleItemEditList)
  arrayItems: orderSaleItemEditList[];
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
  @ApiProperty({
    type: [Number],
    description: descriptionSetProcessOrderStatus,
  })
  setProcessOrderStatus: number[];

  @IsArray()
  @ApiProperty({ type: [Number] })
  responseFormat: number[];

  @IsArray()
  @ApiProperty({ type: [Number] })
  isProductGenerated: number[];

  @IsArray()
  @ApiProperty({ type: [Number] })
  isInvoiceGenerated: number[];

  @IsOptional()
  @IsArray()
  @ApiProperty({ type: [Number],description:descriptionType })
  type: number[];

  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleIdsIds: string[];

  @IsOptional()
  @IsArray()
  @ApiProperty({ type: [String] })
  uids: string[];

  @IsOptional()
  @IsArray()
  @ApiProperty({ type: [String] })
  referenceNumbers: string[];

  @IsOptional()
  @IsArray()
  @ApiProperty({ type: [String] })
  cityIds: string[];

  @IsOptional()
  @IsArray()
  @ApiProperty({ type: [String] })
  branchIds: string[];

  @IsOptional()
  @IsNumber()
  @ApiProperty({})
  productCreatedStartDate: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({})
  productCreatedEndDate: number;

  @IsNumber()
  @ApiProperty({})
  limit: number;

  @IsNumber()
  @ApiProperty({})
  skip: number;

  @IsString()
  @ApiProperty({})
  searchingText: string;

  @IsNumber()
  @ApiProperty({})
  dueStartDate: number;

  @IsNumber()
  @ApiProperty({})
  dueEndDate: number;

  @IsArray()
  @ApiProperty({ type: [String] })
  relationshipManagerIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  orderHeadIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  shopIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  subCategoryIds: string[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionWorkStatus })
  workStatus: number[];
}

export class OrderSaleReportListDto {
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
    description: descriptionListScreenTypeOrderSaleReport,
  })
  screenType: number[];

  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({ type: [Number] })
  responseFormat: number[];

  @IsArray()
  @ApiProperty({ type: [Number] })
  isProductGenerated: number[];

  @IsArray()
  @ApiProperty({ type: [Number] })
  isInvoiceGenerated: number[];

  @IsNumber()
  @ApiProperty({})
  limit: number;

  @IsNumber()
  @ApiProperty({})
  skip: number;
  //

  @IsNumber()
  @ApiProperty({})
  netWeightStart: number;

  @IsNumber()
  @ApiProperty({})
  productCreatedStartDate: number;

  @IsNumber()
  @ApiProperty({})
  productCreatedEndDate: number;

  @IsNumber()
  @ApiProperty({})
  deliveryAssignedStartDate: number;

  @IsNumber()
  @ApiProperty({})
  deliveryAssignedEndDate: number;

  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleIds: string[];

  @IsNumber()
  @ApiProperty({})
  deliveryCompleteStartDate: number;

  @IsNumber()
  @ApiProperty({})
  deliveryCompleteEndDate: number;

  @IsArray()
  @ApiProperty({ type: [Number] })
  deliveryStatus: number[];

  @IsNumber()
  @ApiProperty({})
  agingStartCount: number;

  @IsNumber()
  @ApiProperty({})
  agingEndCount: number;

  @IsNumber()
  @ApiProperty({})
  netWeightEnd: number;

  @IsArray()
  @ApiProperty({ type: [String] })
  huids: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  deliveryExecutiveIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  logisticsPartnerIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleUids: string[];

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
  orderHeadIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  shopIds: string[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionWorkStatus })
  workStatus: number[];

  @IsArray()
  @ApiProperty({ type: [String] })
  referenceIds: string[];

  @IsArray()
  @ApiProperty({ type: [Number], description: descriptionType })
  types: number[];

  @IsNumber()
  @ApiProperty({})
  createdDateStartDate: number;

  @IsNumber()
  @ApiProperty({})
  createdDateEndDate: number;

  @IsArray()
  @ApiProperty({ type: [String] })
  cityIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  branchIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  relationshipManagerIds: string[];

  @IsNumber()
  @ApiProperty({})
  invoiceDateStartDate: number;

  @IsNumber()
  @ApiProperty({})
  invoiceDateEndDate: number;

  @IsArray()
  @ApiProperty({ type: [String] })
  invoiceUids: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  orderProcessMasterIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  orderSetProcessWorkerIds: string[];

  @IsArray()
  @ApiProperty({ type: [Number] })
  orderSetProcessOrderStatus: number[];

  @IsNumber()
  @ApiProperty({})
  processAssignStartDate: number;

  @IsNumber()
  @ApiProperty({})
  processAssignEndDate: number;

  @IsNumber()
  @ApiProperty({})
  processWorkCompletedStartDate: number;

  @IsNumber()
  @ApiProperty({})
  processWorkCompletedEndDate: number;

  @IsNumber()
  @ApiProperty({})
  processWorkStartDate: number;

  @IsNumber()
  @ApiProperty({})
  processWorkEndDate: number;

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionSetProcessOrderStatus,
  })
  setProcessOrderStatus: number[];
}

export class OrderSalesChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleIds: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionStatus })
  status: number;
}

export class OrderSalesProcessMasterChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleProcessMasterIds: string[];

  @IsString()
  @ApiProperty({ description: descriptionStatus })
  description: string;
}
export class OrderSalesWorkStatusChangeDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleIds: string[];

  @IsOptional()
  @IsArray()
  @ApiProperty({ type: [String] })
  productIdsForStockRemove: string[];

  @IsNumber()
  @ApiProperty({ description: descriptionWorkStatus })
  workStatus: number;


  @IsNumber()
  @ApiProperty({  })
  fromWorkStatus: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({  })
  isProductGenerated: number;

  @IsString()
  @ApiProperty({})
  rootCause: string;
  @IsString()
  @ApiProperty({})
  rootCauseId: string;
}
export class OrderSalesHoldDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleIds: string[];

  @IsNumber()
  @ApiProperty({  })
  isHold: number;

  @IsString()
  @ApiProperty({})
  holdDescription: string;

  @IsString()
  @ApiProperty({})
  rootCauseId: string;

  @IsString()
  @ApiProperty({})
  rootCauseName: string;
}

export class OrderSalesGetOrderIdFromQrBarcodeDto {
  @IsString()
  @ApiProperty({})
  value: string;
}

export class OrderSalesGetOrderDetailsFromQrBarcodeDto {
  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionScreenTypeQrBardodeOrderDetails,
  })
  screenType: number[];

  @IsArray()
  @ApiProperty({ type: [Number] })
  responseFormat: number[];

  @IsString()
  @ApiProperty({})
  value: string;
}
export class OrderSalesReworkSetprocessDto {

  
  @IsString()
  @ApiProperty({})
  ordersaleId: string;

  
  @IsString()
  @ApiProperty({})
  reworkRootcauseId: string;

  @IsString()
  @ApiProperty({})
  reworkRootcauseName: string;

  @IsString()
  @ApiProperty({})
  reworkRootcauseDescription: string;

  
  @IsNumber()
  @ApiProperty({})
  fromStatus: number;

}

export class GetWorkCountDto {
  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionScreenTypeGetWorkCount,
  })
  screenType: number[];

  @IsArray()
  @ApiProperty({ type: [String] })
  ohIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  workerIds: string[];

  @IsNumber()
  @ApiProperty({})
  pendingOrderCreatedStartDate: number;

  @IsNumber()
  @ApiProperty({})
  pendingOrderCreatedEndDate: number;

  @IsNumber()
  @ApiProperty({})
  completedOrderCreatedStartDate: number;

  @IsNumber()
  @ApiProperty({})
  completedOrderCreatedEndDate: number;

  @IsNumber()
  @ApiProperty({})
  completedOrderProductCreatedStartDate: number;

  @IsNumber()
  @ApiProperty({})
  completedOrderProductCreatedEndDate: number;

  @IsNumber()
  @ApiProperty({})
  setProcessAssignedStartDate: number;

  @IsNumber()
  @ApiProperty({})
  setProcessAssignedEndDate: number;

  @IsNumber()
  @ApiProperty({})
  setProcessFinishStartDate: number;

  @IsNumber()
  @ApiProperty({})
  setProcessFinishEndDate: number;
}

export class GlobalSearchDto {
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
    description: descriptionScreenTypeGlobalSearch,
  })
  screenType: number[];

  @IsNumber()
  @ApiProperty({})
  startValue: number;

  @IsNumber()
  @ApiProperty({})
  endValue: number;

  @IsArray()
  @ApiProperty({ type: [Number] })
  responseFormat: number[];

  @IsNumber()
  @ApiProperty({})
  limit: number;

  @IsNumber()
  @ApiProperty({})
  skip: number;

  @IsNumber()
  @ApiProperty({ description: descriptionGlobalSearchType })
  type: number;

  @IsString()
  @ApiProperty({})
  mainValue: string;
}
export class SetProcessAssignedOrderSaleListDto {
  @IsNumber()
  @ApiProperty({ description: descriptionSetProcessListSortType })
  sortType: number;
  @IsNumber()
  @ApiProperty({ description: descriptionSetProcessListSortOrder })
  sortOrder: number;

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: descriptionListScreenTypeForSetProcessOrdersaleList,
  })
  screenType: number[];

  @IsArray()
  @ApiProperty({ type: [Number] })
  responseFormat: number[];

  @IsArray()
  @ApiProperty({ type: [String] })
  employeesArray: string[];

  @IsOptional()
  @IsArray()
  @ApiProperty({ type: [String] })
  shopIds: string[];

  @IsOptional()
  @IsArray()
  @ApiProperty({ type: [String] })
  subCategoryIds: string[];

  @IsOptional()
  @IsNumber()
  @ApiProperty({})
  dueStartDate: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({})
  dueEndDate: number;

  @IsOptional()
  @IsString()
  @ApiProperty({})
  searchingText: string;

  @IsNumber()
  @ApiProperty({})
  limit: number;

  @IsNumber()
  @ApiProperty({})
  skip: number;

  @IsArray()
  @ApiProperty({ type: [String] })
  idsArray: string[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: DescriptionOrderSaleProcessOrderStatus,
  })
  workStatusArray: number[];
}

export class OrderSaleHistoryListDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  userIds: string[];

  @IsArray()
  @ApiProperty({ type: [String] })
  createdUserIds: string[];

  @IsArray()
  @ApiProperty({
    type: [Number],
    description: DescriptionOrderSalesHistoriesType,
  })
  types: number[];

  @IsArray()
  @ApiProperty({
    type: [Number],
  })
  statusArray: number[];
}

export class EditOrderSaleGeneralRemarkDto {
  @IsArray()
  @ApiProperty({ type: [String] })
  orderSaleIds: string[];

  @IsString()
  @ApiProperty({})
  generalRemark: string;
}

class orderSaleSplitItemArrayList {
 
  @IsString()
  @ApiProperty({})
  orderSaleItemId: string;


}
class orderSaleSplitArrayList {
 
 

  
  @IsArray()
  @ApiProperty({ type: [orderSaleSplitItemArrayList] })
  @ValidateNested({ each: true })
  @Type(() => orderSaleSplitItemArrayList)
  items: orderSaleSplitItemArrayList[];



}

export class OrderSaleSplitDto {

  
  @IsString()
  @ApiProperty({})
  ordersaleId: string;

  
  @IsString()
  @ApiProperty({})
  ordersaleUid: string;

  
  @IsNumber()
  @ApiProperty({})
  fromStatus: number;


  
  @IsArray()
  @ApiProperty({ type: [orderSaleSplitArrayList] })
  @ValidateNested({ each: true })
  @Type(() => orderSaleSplitArrayList)
  splitArray: orderSaleSplitArrayList[];

}