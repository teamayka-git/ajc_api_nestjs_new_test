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
}
