import { int } from 'aws-sdk/clients/datapipeline';
import { List } from 'aws-sdk/lib/model';
import { ModelWeight } from './model_weight';

export class ModelWeightResponseFormat {
  public orderSaleSetProcessTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().orderSaleSetProcessTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().orderSaleSetProcessTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().orderSaleSetProcessTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public processMasterTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().processMasterTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().processMasterTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().processMasterTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public userTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().userTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().userTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().userTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public globalGalleryTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().globalGalleryTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().globalGalleryTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().globalGalleryTableMedium() };
    }else if (responseFormatArray.includes(startIndex + 3)) {
      return { $project: new ModelWeight().globalGalleryTableMaximum() };
    } else if (responseFormatArray.includes(startIndex + 4)) {
      return { $project: new ModelWeight().globalGalleryTableCustom1() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public orderSaleSetSubProcessTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().orderSaleSetSubProcessTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return {
        $project: new ModelWeight().orderSaleSetSubProcessTableMinimum(),
      };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return {
        $project: new ModelWeight().orderSaleSetSubProcessTableMedium(),
      };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public purchaseBookingTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().purchaseBookingTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().purchaseBookingTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().purchaseBookingTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public purchaseOrderTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().purchaseOrderTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().purchaseOrderTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().purchaseOrderTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  
  public purchaseOrderItemsTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().purchaseOrderItemsTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().purchaseOrderItemsTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().purchaseOrderItemsTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public purchaseBookingItemsTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().purchaseBookingItemsTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().purchaseBookingItemsTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().purchaseBookingItemsTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public subProcessMasterTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().subProcessMasterTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().subProcessMasterTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().subProcessMasterTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public orderSaleHistoryTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().orderSaleHistoryTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().orderSaleHistoryTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().orderSaleHistoryTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public orderSaleItemDocumentsTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().orderSaleItemDocumentsTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().orderSaleItemDocumentsTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().orderSaleItemDocumentsTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }
  public orderSaleDocumentsTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().orderSaleDocumentsTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().orderSaleDocumentsTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().orderSaleDocumentsTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public orderSaleSetprocessDocumentsTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().orderSaleDocumentsTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().orderSaleDocumentsTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().orderSaleDocumentsTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public shopTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().shopTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().shopTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().shopTableMedium() };
    }else if (responseFormatArray.includes(startIndex + 3)) {
      return { $project: { _: 0 } };
    }else if (responseFormatArray.includes(startIndex + 4)) {
      return { $project: new ModelWeight().shopTableCustom1() };
    } else if (responseFormatArray.includes(startIndex + 5)) {
      return { $project: new ModelWeight().shopTableCustom2() };
    } else {
      return { $project: { _: 0 } };
    }
  }
  
  public orderSaleMainTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: new ModelWeight().orderSaleTableMaximum() };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().orderSaleTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().orderSaleTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().orderSaleTableMedium() };
    } else {
      return { $project: new ModelWeight().orderSaleTableMaximum() };
    }
  }

  public orderSaleItemsTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().orderSaleItemsTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().orderSaleItemsTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().orderSaleItemsTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public productTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().productTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().productTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().productTableMedium() };
    }else if (responseFormatArray.includes(startIndex + 3)) {
      return { $project: { _: 0 } };
    } else if (responseFormatArray.includes(startIndex + 4)) {
      return { $project: new ModelWeight().productTableCustom1() };
    } else if (responseFormatArray.includes(startIndex + 5)) {
      return { $project: new ModelWeight().productTableCustom2() };
    } else if (responseFormatArray.includes(startIndex + 6)) {
      return { $project: new ModelWeight().productTableCustom3() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public subCategoryTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().subCategoryTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().subCategoryTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().subCategoryTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public categoryTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().categoryTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().categoryTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().categoryTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }
  public rootcauseTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().rootCauseTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().rootCauseTableMinimumn() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().rootCauseTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }
  public deliveryTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().deliveryTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().deliveryTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().deliveryTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public deliveryItemsTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().deliveryItemsTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().deliveryItemsTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().deliveryItemsTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public invoiceTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().invoiceTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().invoiceTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().invoiceTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }
  public invoiceItemsTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().invoiceItemsTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().invoiceItemsTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().invoiceItemsTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }
  public deliveryChellanTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().deliveryChellanTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().deliveryChellanTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().deliveryChellanTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }
  public deliveryProviderTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().deliveryProviderTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().deliveryProviderTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().deliveryProviderTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public deliveryHubTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().deliveryHubTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().deliveryHubTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().deliveryHubTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public customerTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().customerTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().customerTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().customerTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public deliveryTempTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().deliveryTempTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().deliveryTempTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().deliveryTempTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public branchTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().branchTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().branchTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().branchTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public ratecardTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().ratecardTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().ratecardTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().ratecardTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }
  public ratecardPercentagesTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().ratecardPercentagesTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().ratecardPercentagesTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().ratecardPercentagesTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public cityTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().cityTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().cityTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().cityTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }
  public tdsMasterTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().tdsMasterTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().tdsMasterTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().tdsMasterTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public tcsMasterTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().tcsMasterTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().tcsMasterTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().tcsMasterTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public rateBaseMasterTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().rateBaseMasterTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().rateBaseMasterTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().rateBaseMasterTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public groupMasterTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().groupTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().groupTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().groupTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }
  public productDocumentLinkingTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().productDocumentLinkingTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return {
        $project: new ModelWeight().productDocumentLinkingTableMinimum(),
      };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return {
        $project: new ModelWeight().productDocumentLinkingTableMedium(),
      };
    }else if (responseFormatArray.includes(startIndex + 3)) {
      return {
        $project: new ModelWeight().productDocumentLinkingTableCustom1(),
      };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public productStoneLinkingTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().productStonelinkingTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().productStonelinkingTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().productStonelinkingTableMedium() };
    } else if (responseFormatArray.includes(startIndex + 3)) {
      return { $project: { _: 0 } };
    } else if (responseFormatArray.includes(startIndex + 4)) {
      return { $project: new ModelWeight().productStonelinkingTableCustom1() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public stoneMasterTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().stoneMasterTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().stoneMasterTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().stoneMasterTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public colourMasterTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().colourMasterTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().colourMasterTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().colourMasterTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public deliveryRejectedPendingsTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return {
        $project: new ModelWeight().deliveryRejectedPendingsTableLight(),
      };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return {
        $project: new ModelWeight().deliveryRejectedPendingsTableMinimum(),
      };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return {
        $project: new ModelWeight().deliveryRejectedPendingsTableMedium(),
      };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public deliveryReturnTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().deliveryReturnsTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().deliveryReturnsTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().deliveryReturnsTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public deliveryReturnItemsTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().deliveryReturnItemsTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().deliveryReturnItemsTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().deliveryReturnItemsTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public departmentTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().departmentTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().departmentTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().departmentTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public employeeableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().employeeTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().employeeTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().employeeTableMinimum() };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public deliveryCounterBundleResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: new ModelWeight().deliveryCounterBundleTableMaximum() };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().deliveryCounterBundleTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return {
        $project: new ModelWeight().deliveryCounterBundleTableMinimum(),
      };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().deliveryCounterBundleTableMedium() };
    } else {
      return { $project: new ModelWeight().deliveryCounterBundleTableMaximum() };
    }
  }

  public deliveryCounterBundleItemsResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return {
        $project: new ModelWeight().deliveryCounterBundleItemsTableLight(),
      };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return {
        $project: new ModelWeight().deliveryCounterBundleItemsTableMinimum(),
      };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return {
        $project: new ModelWeight().deliveryCounterBundleItemsTableMedium(),
      };
    } else {
      return { $project: { _: 0 } };
    }
  }

  public deliveryCounterResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().deliveryCounterTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().deliveryCounterTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().deliveryCounterTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }
  public productTagLinkingResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().productTagLinkingTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().productTagLinkingTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().productTagLinkingTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }
  public tagMasterResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().tagMasterTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().tagMasterTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().tagMasterTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }
  public tagDocumentsLinkingResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: { _: 0 } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().tagDocumentLinkingTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().tagDocumentLinkingTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().tagDocumentLinkingTableMedium() };
    } else {
      return { $project: { _: 0 } };
    }
  }
}
