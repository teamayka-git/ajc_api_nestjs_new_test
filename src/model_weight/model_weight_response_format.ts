import { int } from 'aws-sdk/clients/datapipeline';
import { List } from 'aws-sdk/lib/model';
import { ModelWeight } from './model_weight';

export class ModelWeightResponseFormat {
  public orderSaleSetProcessTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: new ModelWeight().orderSaleItemsTableMaximum() };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().orderSaleItemsTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().orderSaleItemsTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().orderSaleItemsTableMedium() };
    } else {
      return { $project: new ModelWeight().orderSaleItemsTableMaximum() };
    }
  }


  public processMasterTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: new ModelWeight().processMasterTableMaximum() };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().processMasterTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().processMasterTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().processMasterTableMedium() };
    } else {
      return { $project: new ModelWeight().processMasterTableMaximum() };
    }
  }

  
  public userTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: new ModelWeight().userTableMaximum() };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().userTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().userTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().userTableMedium() };
    } else {
      return { $project: new ModelWeight().userTableMaximum() };
    }
  }


  
  
  public globalGalleryTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: new ModelWeight().globalGalleryTableMaximum() };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().globalGalleryTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().globalGalleryTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().globalGalleryTableMedium() };
    } else {
      return { $project: new ModelWeight().globalGalleryTableMaximum() };
    }
  }
  
  public orderSaleSetSubProcessTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: new ModelWeight().orderSaleSetSubProcessTableMaximum() };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().orderSaleSetSubProcessTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().orderSaleSetSubProcessTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().orderSaleSetSubProcessTableMedium() };
    } else {
      return { $project: new ModelWeight().orderSaleSetSubProcessTableMaximum() };
    }
  }
  
  public subProcessMasterTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: new ModelWeight().subProcessMasterTableMaximum() };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().subProcessMasterTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().subProcessMasterTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().subProcessMasterTableMedium() };
    } else {
      return { $project: new ModelWeight().subProcessMasterTableMaximum() };
    }
  }


  
  
  public orderSaleHistoryTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: new ModelWeight().orderSaleHistoryTableMaximum() };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().orderSaleHistoryTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().orderSaleHistoryTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().orderSaleHistoryTableMedium() };
    } else {
      return { $project: new ModelWeight().orderSaleHistoryTableMaximum() };
    }
  }

  
  
  public orderSaleDocumentsTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: new ModelWeight().orderSaleDocumentsTableMaximum() };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().orderSaleDocumentsTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().orderSaleDocumentsTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().orderSaleDocumentsTableMedium() };
    } else {
      return { $project: new ModelWeight().orderSaleDocumentsTableMaximum() };
    }
  }
  
  public shopTableResponseFormat(
    startIndex: int,
    responseFormatArray: List,
  ): Object {
    if (responseFormatArray.length == 0) {
      return { $project: new ModelWeight().shopTableMaximum() };
    }

    if (responseFormatArray.includes(startIndex)) {
      return { $project: new ModelWeight().shopTableLight() };
    } else if (responseFormatArray.includes(startIndex + 1)) {
      return { $project: new ModelWeight().shopTableMinimum() };
    } else if (responseFormatArray.includes(startIndex + 2)) {
      return { $project: new ModelWeight().shopTableMedium() };
    } else {
      return { $project: new ModelWeight().shopTableMaximum() };
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
}
