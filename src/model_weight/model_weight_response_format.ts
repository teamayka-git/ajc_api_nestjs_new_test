import { int } from 'aws-sdk/clients/datapipeline';
import { List } from 'aws-sdk/lib/model';
import { ModelWeight } from './model_weight';

export class ModelWeightResponseFormat {
  public orderSaleSetProcessTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().orderSaleItemsTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().orderSaleItemsTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().orderSaleItemsTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }


  public processMasterTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().processMasterTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().processMasterTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().processMasterTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }

  
  public userTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().userTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().userTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().userTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }


  
  
  public globalGalleryTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().globalGalleryTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().globalGalleryTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().globalGalleryTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }
  
  public orderSaleSetSubProcessTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().orderSaleSetSubProcessTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().orderSaleSetSubProcessTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().orderSaleSetSubProcessTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }
  
  public subProcessMasterTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().subProcessMasterTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().subProcessMasterTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().subProcessMasterTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }


  
  
  public orderSaleHistoryTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().orderSaleHistoryTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().orderSaleHistoryTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().orderSaleHistoryTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }

  
  
  public orderSaleDocumentsTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().orderSaleDocumentsTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().orderSaleDocumentsTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().orderSaleDocumentsTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }
  
  public shopTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().shopTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().shopTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().shopTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }

   
  public orderSaleMainTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().orderSaleTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().orderSaleTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().orderSaleTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }

   
  public orderSaleItemsTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().orderSaleItemsTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().orderSaleItemsTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().orderSaleItemsTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }

   
  public productTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().productTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().productTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().productTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }

   
  public subCategoryTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().subCategoryTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().subCategoryTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().subCategoryTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }

   
  public categoryTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().categoryTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().categoryTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().categoryTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }
  public rootcauseTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().rootCauseTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().rootCauseTableMinimumn() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().rootCauseTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }
  public deliveryTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().deliveryTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().deliveryTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().deliveryTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }


  
  public deliveryItemsTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().deliveryItemsTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().deliveryItemsTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().deliveryItemsTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }
  
  public invoiceTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().invoiceTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().invoiceTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().invoiceTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }
  public invoiceItemsTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().invoiceItemsTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().invoiceItemsTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().invoiceItemsTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }
  public deliveryChellanTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().deliveryChellanTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().deliveryChellanTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().deliveryChellanTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }
  public deliveryProviderTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().deliveryProviderTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().deliveryProviderTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().deliveryProviderTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }


  public deliveryHubTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().deliveryHubTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().deliveryHubTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().deliveryHubTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }

  public customerTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().customerTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().customerTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().customerTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }

  public deliveryTempTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().deliveryTempTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().deliveryTempTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().deliveryTempTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }



  public branchTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().branchTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().branchTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().branchTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }


  public ratecardTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().ratecardTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().ratecardTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().ratecardTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }
  public ratecardPercentagesTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().ratecardPercentagesTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().ratecardPercentagesTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().ratecardPercentagesTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }

  public cityTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().cityTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().cityTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().cityTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }
  public tdsMasterTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().tdsMasterTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().tdsMasterTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().tdsMasterTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }

  public tcsMasterTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().tcsMasterTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().tcsMasterTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().tcsMasterTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }

  public rateBaseMasterTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().rateBaseMasterTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().rateBaseMasterTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().rateBaseMasterTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }

  public groupMasterTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().groupTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().groupTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().groupTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }
  public productDocumentLinkingTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().productDocumentLinkingTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().productDocumentLinkingTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().productDocumentLinkingTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }



  
  public productStoneLinkingTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().productStonelinkingTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().productStonelinkingTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().productStonelinkingTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }

  public stoneMasterTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().stoneMasterTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().stoneMasterTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().stoneMasterTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }

  public colourMasterTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: {   _: 0,  } };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().colourMasterTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().colourMasterTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().colourMasterTableMedium() };
    } else {
      return { $project: {   _: 0,  } };
    }
  }


}
