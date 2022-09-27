import { Injectable } from '@nestjs/common';
import { ModelWeight } from 'src/model_weight/model_weight';

@Injectable()
export class ResponseFormatService {
  async deliveries() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().deliveryTableLight(),
        Minimum: new ModelWeight().deliveryTableMinimum(),
        Medium: new ModelWeight().deliveryTableMedium(),
        Maximum: new ModelWeight().deliveryTableMaximum(),
      },
    };
    return responseJSON;
  }

  async user() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().userTableLight(),
        Minimum: new ModelWeight().userTableMinimum(),
        Medium: new ModelWeight().userTableMedium(),
        Maximum: new ModelWeight().userTableMaximum(),
      },
    };
    return responseJSON;
  }

  async globalGallery() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().globalGalleryTableLight(),
        Minimum: new ModelWeight().globalGalleryTableMinimum(),
        Medium: new ModelWeight().globalGalleryTableMedium(),
        Maximum: new ModelWeight().globalGalleryTableMaximum(),
      },
    };
    return responseJSON;
  }

  async deliveryHub() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().deliveryHubTableLight(),
        Minimum: new ModelWeight().deliveryHubTableMinimum(),
        Medium: new ModelWeight().deliveryHubTableMedium(),
        Maximum: new ModelWeight().deliveryHubTableMaximum(),
      },
    };
    return responseJSON;
  }

  async shop() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().shopTableLight(),
        Minimum: new ModelWeight().shopTableMinimum(),
        Medium: new ModelWeight().shopTableMedium(),
        Maximum: new ModelWeight().shopTableMaximum(),
      },
    };
    return responseJSON;
  }

  async deliveryItems() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().deliveryItemsTableLight(),
        Minimum: new ModelWeight().deliveryItemsTableMinimum(),
        Medium: new ModelWeight().deliveryItemsTableMedium(),
        Maximum: new ModelWeight().deliveryItemsTableMaximum(),
      },
    };
    return responseJSON;
  }

  async orderSale() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().orderSaleTableLight(),
        Minimum: new ModelWeight().orderSaleTableMinimum(),
        Medium: new ModelWeight().orderSaleTableMedium(),
        Maximum: new ModelWeight().orderSaleTableMaximum(),
      },
    };
    return responseJSON;
  }

  async subCategories() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().subCategoryTableLight(),
        Minimum: new ModelWeight().subCategoryTableMinimum(),
        Medium: new ModelWeight().subCategoryTableMedium(),
        Maximum: new ModelWeight().subCategoryTableMaximum(),
      },
    };
    return responseJSON;
  }

  async invoice() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().invoiceTableLight(),
        Minimum: new ModelWeight().invoiceTableMinimum(),
        Medium: new ModelWeight().invoiceTableMedium(),
        Maximum: new ModelWeight().invoiceTableMaximum(),
      },
    };
    return responseJSON;
  }

  async invoiceItems() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().invoiceItemsTableLight(),
        Minimum: new ModelWeight().invoiceItemsTableMinimum(),
        Medium: new ModelWeight().invoiceItemsTableMedium(),
        Maximum: new ModelWeight().invoiceItemsTableMaximum(),
      },
    };
    return responseJSON;
  }
  async colourMaster() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().colourMasterTableLight(),
        Minimum: new ModelWeight().colourMasterTableMinimum(),
        Medium: new ModelWeight().colourMasterTableMedium(),
        Maximum: new ModelWeight().colourMasterTableMaximum(),
      },
    };
    return responseJSON;
  }
  async stoneMaster() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().stoneMasterTableLight(),
        Minimum: new ModelWeight().stoneMasterTableMinimum(),
        Medium: new ModelWeight().stoneMasterTableMedium(),
        Maximum: new ModelWeight().stoneMasterTableMaximum(),
      },
    };
    return responseJSON;
  }
  async productStoneLinking() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().productStonelinkingTableLight(),
        Minimum: new ModelWeight().productStonelinkingTableMinimum(),
        Medium: new ModelWeight().productStonelinkingTableMedium(),
        Maximum: new ModelWeight().productStonelinkingTableMaximum(),
      },
    };
    return responseJSON;
  }
  async productDocumentsLinking() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().productDocumentLinkingTableLight(),
        Minimum: new ModelWeight().productDocumentLinkingTableMinimum(),
        Medium: new ModelWeight().productDocumentLinkingTableMedium(),
        Maximum: new ModelWeight().productDocumentLinkingTableMaximum(),
      },
    };
    return responseJSON;
  }
  async groupMaster() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().colourMasterTableLight(),
        Minimum: new ModelWeight().colourMasterTableMinimum(),
        Medium: new ModelWeight().colourMasterTableMedium(),
        Maximum: new ModelWeight().colourMasterTableMaximum(),
      },
    };
    return responseJSON;
  }
  async rateBaseMaster() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().rateBaseMasterTableLight(),
        Minimum: new ModelWeight().rateBaseMasterTableMinimum(),
        Medium: new ModelWeight().rateBaseMasterTableMedium(),
        Maximum: new ModelWeight().rateBaseMasterTableMaximum(),
      },
    };
    return responseJSON;
  }
  async tcsMaster() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().tcsMasterTableLight(),
        Minimum: new ModelWeight().tcsMasterTableMinimum(),
        Medium: new ModelWeight().tcsMasterTableMedium(),
        Maximum: new ModelWeight().tcsMasterTableMaximum(),
      },
    };
    return responseJSON;
  }
  async tdsMaster() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().tdsMasterTableLight(),
        Minimum: new ModelWeight().tdsMasterTableMinimum(),
        Medium: new ModelWeight().tdsMasterTableMedium(),
        Maximum: new ModelWeight().tdsMasterTableMaximum(),
      },
    };
    return responseJSON;
  }
  async city() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().cityTableLight(),
        Minimum: new ModelWeight().cityTableMinimum(),
        Medium: new ModelWeight().cityTableMedium(),
        Maximum: new ModelWeight().cityTableMaximum(),
      },
    };
    return responseJSON;
  }
  async rateCardPercentage() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().ratecardPercentagesTableLight(),
        Minimum: new ModelWeight().ratecardPercentagesTableMinimum(),
        Medium: new ModelWeight().ratecardPercentagesTableMedium(),
        Maximum: new ModelWeight().ratecardPercentagesTableMaximum(),
      },
    };
    return responseJSON;
  }
  async rateCard() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().ratecardTableLight(),
        Minimum: new ModelWeight().ratecardTableMinimum(),
        Medium: new ModelWeight().ratecardTableMedium(),
        Maximum: new ModelWeight().ratecardTableMaximum(),
      },
    };
    return responseJSON;
  }
  async orderSaleItems() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().orderSaleTableLight(),
        Minimum: new ModelWeight().orderSaleTableMinimum(),
        Medium: new ModelWeight().orderSaleTableMedium(),
        Maximum: new ModelWeight().orderSaleTableMaximum(),
      },
    };
    return responseJSON;
  }
  async processMasters() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().processMasterTableLight(),
        Minimum: new ModelWeight().processMasterTableMinimum(),
        Medium: new ModelWeight().processMasterTableMedium(),
        Maximum: new ModelWeight().processMasterTableMaximum(),
      },
    };
    return responseJSON;
  }
  async ordersaleSetSubProcess() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().orderSaleSetSubProcessTableLight(),
        Minimum: new ModelWeight().orderSaleSetSubProcessTableMinimum(),
        Medium: new ModelWeight().orderSaleSetSubProcessTableMedium(),
        Maximum: new ModelWeight().orderSaleSetSubProcessTableMaximum(),
      },
    };
    return responseJSON;
  }
  async subProcessMaster() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().subProcessMasterTableLight(),
        Minimum: new ModelWeight().subProcessMasterTableMinimum(),
        Medium: new ModelWeight().subProcessMasterTableMedium(),
        Maximum: new ModelWeight().subProcessMasterTableMaximum(),
      },
    };
    return responseJSON;
  }
  async ordersaleHistories() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().orderSaleHistoryTableLight(),
        Minimum: new ModelWeight().orderSaleHistoryTableMinimum(),
        Medium: new ModelWeight().orderSaleHistoryTableMedium(),
        Maximum: new ModelWeight().orderSaleHistoryTableMaximum(),
      },
    };
    return responseJSON;
  }
  async ordersaleDocuments() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().orderSaleDocumentsTableLight(),
        Minimum: new ModelWeight().orderSaleDocumentsTableMinimum(),
        Medium: new ModelWeight().orderSaleDocumentsTableMedium(),
        Maximum: new ModelWeight().orderSaleDocumentsTableMaximum(),
      },
    };
    return responseJSON;
  }
  async product() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().productTableLight(),
        Minimum: new ModelWeight().productTableMinimum(),
        Medium: new ModelWeight().productTableMedium(),
        Maximum: new ModelWeight().productTableMaximum(),
        custom1:new ModelWeight().productTableCustom1(),
      },
    };
    return responseJSON;
  }
  async category() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().categoryTableLight(),
        Minimum: new ModelWeight().categoryTableMinimum(),
        Medium: new ModelWeight().categoryTableMedium(),
        Maximum: new ModelWeight().categoryTableMaximum(),
      },
    };
    return responseJSON;
  }
  async rootcause() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().rootCauseTableLight(),
        Minimum: new ModelWeight().rootCauseTableMinimumn(),
        Medium: new ModelWeight().rootCauseTableMedium(),
        Maximum: new ModelWeight().rootCauseTableMaximum(),
      },
    };
    return responseJSON;
  }
  async deliveryChallan() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().deliveryChellanTableLight(),
        Minimum: new ModelWeight().deliveryChellanTableMinimum(),
        Medium: new ModelWeight().deliveryChellanTableMedium(),
        Maximum: new ModelWeight().deliveryChellanTableMaximum(),
      },
    };
    return responseJSON;
  }
  async deliveryProvider() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().deliveryProviderTableLight(),
        Minimum: new ModelWeight().deliveryProviderTableMinimum(),
        Medium: new ModelWeight().deliveryProviderTableMedium(),
        Maximum: new ModelWeight().deliveryProviderTableMaximum(),
      },
    };
    return responseJSON;
  }
  async customer() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().customerTableLight(),
        Minimum: new ModelWeight().customerTableMinimum(),
        Medium: new ModelWeight().customerTableMedium(),
        Maximum: new ModelWeight().customerTableMaximum(),
      },
    };
    return responseJSON;
  }
  async deliveryTemp() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().deliveryTempTableLight(),
        Minimum: new ModelWeight().deliveryTempTableMinimum(),
        Medium: new ModelWeight().deliveryTempTableMedium(),
        Maximum: new ModelWeight().deliveryTempTableMaximum(),
      },
    };
    return responseJSON;
  }
  async branch() {
    var dateTime = new Date().getTime();

    const responseJSON = {
      message: 'success',
      data: {
        Light: new ModelWeight().branchTableLight(),
        Minimum: new ModelWeight().branchTableMinimum(),
        Medium: new ModelWeight().branchTableMedium(),
        Maximum: new ModelWeight().branchTableMaximum(),
      },
    };
    return responseJSON;
  }

}
