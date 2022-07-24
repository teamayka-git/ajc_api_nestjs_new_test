export class ModelWeight {
  public invoiceItemsTableLight(): Object {
    return {
      _id: 1,
      _invoiceId: 1,
      _orderId: 1,
      _orderUid: 1,
      _categoryName: 1,
      _subCategoryName: 1,
      _productName: 1,
      _purity: 1,
      _hsnCode: 1,
      _huid: 1,
      _amount: 1,
      _productBarcode: 1,
      _productId: 1,
    };
  }
  public invoiceItemsTableMinimum(): Object {
    return {
      _id: 1,
      _invoiceId: 1,
      _orderId: 1,
      _orderUid: 1,
      _categoryName: 1,
      _subCategoryName: 1,
      _productName: 1,
      _purity: 1,
      _hsnCode: 1,
      _huid: 1,
      _netWeight: 1,
      _amount: 1,
      _stoneAmount: 1,
      _totalValue: 1,
      _productBarcode: 1,
      _productId: 1,
      _createdUserId: 1,
      _status: 1,
    };
  }
  public invoiceItemsTableMedium(): Object {
    return {
      _id: 1,
      _invoiceId: 1,
      _orderId: 1,
      _orderUid: 1,
      _categoryName: 1,
      _subCategoryName: 1,
      _productName: 1,
      _purity: 1,
      _hsnCode: 1,
      _huid: 1,
      _grossWeight: 1,
      _stoneWeight: 1,
      _netWeight: 1,
      _tought: 1,
      _pureWeight: 1,
      _pureWeightHundredPercentage: 1,
      _unitRate: 1,
      _amount: 1,
      _stoneAmount: 1,
      _totalValue: 1,
      _cgst: 1,
      _sgst: 1,
      _igst: 1,
      _metalAmountGst: 1,
      _stoneAmountGst: 1,
      _makingChargeWeightHundredPercentage: 1,
      _makingChargeAmount: 1,
      _productBarcode: 1,
      _productId: 1,
      _createdUserId: 1,
      _status: 1,
    };
  }
  public invoiceItemsTableMaximum(): Object {
    return {
      _id: 1,
      _invoiceId: 1,
      _orderId: 1,
      _orderUid: 1,
      _categoryName: 1,
      _subCategoryName: 1,
      _productName: 1,
      _purity: 1,
      _hsnCode: 1,
      _huid: 1,
      _grossWeight: 1,
      _stoneWeight: 1,
      _netWeight: 1,
      _tought: 1,
      _pureWeight: 1,
      _pureWeightHundredPercentage: 1,
      _unitRate: 1,
      _amount: 1,
      _stoneAmount: 1,
      _totalValue: 1,
      _cgst: 1,
      _sgst: 1,
      _igst: 1,
      _metalAmountGst: 1,
      _stoneAmountGst: 1,
      _makingChargeWeightHundredPercentage: 1,
      _makingChargeAmount: 1,
      _productBarcode: 1,
      _productId: 1,
      _createdUserId: 1,
      _createdAt: 1,
      _updatedUserId: 1,
      _updatedAt: 1,
      _status: 1,
    };
  }
  public invoiceTableLight(): Object {
    return {
      _id: 1,
      _userId: 1,
      _uid: 1,
    };
  }
  public invoiceTableMinimum(): Object {
    return {
      _id: 1,
      _userId: 1,
      _uid: 1,
      _rootCauseId: 1,
      _description: 1,
      _createdUserId: 1,
      _status: 1,
    };
  }
  public invoiceTableMedium(): Object {
    return {
      _id: 1,
      _userId: 1,
      _uid: 1,
      _billMode: 1,
      _grossAmount: 1,
      _halmarkingCharge: 1,
      _otherCharge: 1,
      _roundOff: 1,
      _netTotal: 1,
      _tdsReceivable: 1,
      _tdsPayable: 1,
      _netReceivableAmount: 1,
      _isDelivered: 1,
      _cgstHalmarkCharge: 1,
      _cgstOtherCharge: 1,
      _sgstHalmarkCharge: 1,
      _sgstOtherCharge: 1,
      _igstHalmarkCharge: 1,
      _igstOtherCharge: 1,
      _rootCauseId: 1,
      _description: 1,
      _createdUserId: 1,
      _status: 1,
    };
  }
  public invoiceTableMaximum(): Object {
    return {
      _id: 1,
      _userId: 1,
      _uid: 1,
      _billMode: 1,
      _grossAmount: 1,
      _halmarkingCharge: 1,
      _otherCharge: 1,
      _roundOff: 1,
      _netTotal: 1,
      _tdsReceivable: 1,
      _tdsPayable: 1,
      _netReceivableAmount: 1,
      _isDelivered: 1,
      _cgstHalmarkCharge: 1,
      _cgstOtherCharge: 1,
      _sgstHalmarkCharge: 1,
      _sgstOtherCharge: 1,
      _igstHalmarkCharge: 1,
      _igstOtherCharge: 1,
      _rootCauseId: 1,
      _description: 1,
      _createdUserId: 1,
      _createdAt: 1,
      _updatedUserId: 1,
      _updatedAt: 1,
      _status: 1,
    };
  }
  public subCategoryTableLight(): Object {
    return {
      _id: 1,
      _name: 1,
      _code: 1,
    };
  }
  public subCategoryTableMinimum(): Object {
    return {
      _id: 1,
      _name: 1,
      _code: 1,
      _description: 1,
      _categoryId: 1,
      _globalGalleryId: 1,
      _dataGuard: 1,
      _createdUserId: 1,
      _status: 1,
    };
  }
  public subCategoryTableMedium(): Object {
    return {
      _id: 1,
      _name: 1,
      _code: 1,
      _description: 1,
      _categoryId: 1,
      _hmSealing: 1,
      _defaultValueAdditionPercentage: 1,
      _globalGalleryId: 1,
      _dataGuard: 1,
      _createdUserId: 1,
      _status: 1,
    };
  }
  public subCategoryTableMaximum(): Object {
    return {
      _id: 1,
      _name: 1,
      _code: 1,
      _description: 1,
      _categoryId: 1,
      _hmSealing: 1,
      _defaultValueAdditionPercentage: 1,
      _globalGalleryId: 1,
      _dataGuard: 1,
      _createdUserId: 1,
      _createdAt: 1,
      _updatedUserId: 1,
      _updatedAt: 1,
      _status: 1,
    };
  }
  public orderSaleTableLight(): Object {
    return {
      _id: 1,
      _shopId: 1,
      _uid: 1,
      _dueDate: 1,
      _workStatus: 1,
      _type: 1,
    };
  }
  public orderSaleTableMinimum(): Object {
    return {
      _id: 1,
      _shopId: 1,
      _uid: 1,
      _dueDate: 1,
      _workStatus: 1,
      _type: 1,
      _rootCauseId: 1,
      _createdUserId: 1,
      _orderHeadId: 1,
      _description: 1,
      _rootCause: 1,
      _status: 1,
    };
  }
  public orderSaleTableMedium(): Object {
    return {
      _id: 1,
      _shopId: 1,
      _uid: 1,
      _dueDate: 1,
      _workStatus: 1,
      _type: 1,
      _rootCauseId: 1,
      _createdUserId: 1,
      _orderHeadId: 1,
      _description: 1,
      _deliveryType: 1,
      _rootCause: 1,
      _generalRemark: 1,
      _status: 1,
    };
  }
  public orderSaleTableMaximum(): Object {
    return {
      _id: 1,
      _shopId: 1,
      _uid: 1,
      _dueDate: 1,
      _workStatus: 1,
      _rootCauseId: 1,
      _deliveryType: 1,
      _type: 1,
      _isReWork: 1,
      _rootCause: 1,
      _orderHeadId: 1,
      _description: 1,
      _generalRemark: 1,
      _createdUserId: 1,
      _createdAt: 1,
      _updatedUserId: 1,
      _updatedAt: 1,
      _status: 1,
    };
  }

  public orderSaleItemsTableLight(): Object {
    return {
      _id: 1,
      _quantity: 1,
      _size: 1,
      _weight: 1,
      _uid: 1,
      _stoneColour: 1,
    };
  }
  public orderSaleItemsTableMinimum(): Object {
    return {
      _id: 1,
      _quantity: 1,
      _size: 1,
      _weight: 1,
      _uid: 1,
      _stoneColour: 1,
      _orderSaleId: 1,
      _subCategoryId: 1,
      _createdUserId: 1,
      _updatedUserId: 1,
      _productId: 1,
      _designId: 1,
      _status: 1,
    };
  }
  public orderSaleItemsTableMedium(): Object {
    return {
      _id: 1,
      _quantity: 1,
      _size: 1,
      _weight: 1,
      _uid: 1,
      _stoneColour: 1,
      _orderSaleId: 1,
      _subCategoryId: 1,
      _createdUserId: 1,
      _updatedUserId: 1,
      _isInvoiceGenerated: 1,
      _isProductGenerated: 1,
      _productId: 1,
      _designId: 1,
      _status: 1,
      _stockStatus: 1,
      _isRhodium: 1,
      _isMatFinish: 1,
    };
  }
  public orderSaleItemsTableMaximum(): Object {
    return {
      _id: 1,
      _orderSaleId: 1,
      _subCategoryId: 1,
      _quantity: 1,
      _size: 1,
      _weight: 1,
      _uid: 1,
      _stoneColour: 1,
      _isInvoiceGenerated: 1,
      _isProductGenerated: 1,
      _productData: 1,
      _productId: 1,
      _designId: 1,
      _stockStatus: 1,
      _isRhodium: 1,
      _isMatFinish: 1,
      _createdUserId: 1,
      _createdAt: 1,
      _updatedUserId: 1,
      _updatedAt: 1,
      _status: 1,
    };
  }
  public processMasterTableLight(): Object {
    return {
      _id: 1,
      _name: 1,
      _code: 1,
      _createdUserId: 1,
      _status: 1,
    };
  }
  public processMasterTableMinimum(): Object {
    return {
      _id: 1,
      _name: 1,
      _code: 1,
      _isAutomatic: 1,
      _maxHours: 1,
      _parentId: 1,
      _dataGuard: 1,
      _createdUserId: 1,
      _status: 1,
    };
  }
  public processMasterTableMedium(): Object {
    return {
      _id: 1,
      _name: 1,
      _code: 1,
      _isAutomatic: 1,
      _maxHours: 1,
      _parentId: 1,
      _dataGuard: 1,
      _createdUserId: 1,
      _status: 1,
    };
  }
  public processMasterTableMaximum(): Object {
    return {
      _id: 1,
      _name: 1,
      _code: 1,
      _isAutomatic: 1,
      _maxHours: 1,
      _parentId: 1,
      _dataGuard: 1,
      _createdUserId: 1,
      _createdAt: 1,
      _updatedUserId: 1,
      _updatedAt: 1,
      _status: 1,
    };
  }

  public deliveryItemsTableLight(): Object {
    return {
      _id: 1,
      _deliveryId: 1,
      _orderId: 1,
      _invoiceId: 1,
    };
  }
  public deliveryItemsTableMinimum(): Object {
    return {
      _id: 1,
      _deliveryId: 1,
      _orderId: 1,
      _invoiceId: 1,
      _createdUserId: 1,
      _status: 1,
    };
  }
  public deliveryItemsTableMedium(): Object {
    return {
      _id: 1,
      _deliveryId: 1,
      _orderId: 1,
      _invoiceId: 1,
      _createdUserId: 1,
      _createdAt: 1,
      _updatedUserId: 1,
      _updatedAt: 1,
      _status: 1,
    };
  }
  public deliveryItemsTableMaximum(): Object {
    return {
      _id: 1,
      _deliveryId: 1,
      _orderId: 1,
      _invoiceId: 1,
      _createdUserId: 1,
      _createdAt: 1,
      _updatedUserId: 1,
      _updatedAt: 1,
      _status: 1,
    };
  }
  public shopTableLight(): Object {
    return {
      _id: 1,
      _uid: 1,
      _name: 1,
    };
  }
  public shopTableMinimum(): Object {
    return {
      _id: 1,
      _cityId: 1,
      _uid: 1,
      _name: 1,
      _branchId: 1,
      _orderHeadId: 1,
      _globalGalleryId: 1,
      _relationshipManagerId: 1,
      _rateCardId: 1,
      _tdsId: 1,
      _tcsId: 1,
      _rateBaseMasterId: 1,
      _agentId: 1,
      _createdUserId: 1,
      _dataGuard: 1,

      _status: 1,
    };
  }
  public shopTableMedium(): Object {
    return {
      _id: 1,
      _cityId: 1,
      _uid: 1,
      _name: 1,
      _orderSaleRate: 1,
      _stockSaleRate: 1,
      _shopType: 1,
      _branchId: 1,
      _orderHeadId: 1,
      _address: 1,
      _relationshipManagerId: 1,
      _isSupplier: 1,
      _globalGalleryId: 1,
      _panCardNumber: 1,
      _billingModeSale: 1,
      _isTaxIgstEnabled: 1,
      _tdsTcsStatus: 1,
      _billingModePurchase: 1,
      _hallmarkingMandatoryStatus: 1,
      _rateCardId: 1,
      _gstNumber: 1,
      _tdsId: 1,
      _tcsId: 1,
      _creditAmount: 1,
      _creditDays: 1,
      _rateBaseMasterId: 1,
      _stonePricing: 1,
      _chatPermissions: 1,
      _agentId: 1,
      _agentCommision: 1,
      _commisionType: 1,
      _location: 1,
      _createdUserId: 1,
      _status: 1,
    };
  }
  public shopTableMaximum(): Object {
    return {
      _id: 1,
      _cityId: 1,
      _uid: 1,
      _name: 1,
      _orderSaleRate: 1,
      _stockSaleRate: 1,
      _shopType: 1,
      _branchId: 1,
      _orderHeadId: 1,
      _address: 1,
      _relationshipManagerId: 1,
      _isSupplier: 1,
      _globalGalleryId: 1,
      _panCardNumber: 1,
      _billingModeSale: 1,
      _isTaxIgstEnabled: 1,
      _tdsTcsStatus: 1,
      _billingModePurchase: 1,
      _hallmarkingMandatoryStatus: 1,
      _rateCardId: 1,
      _gstNumber: 1,
      _tdsId: 1,
      _tcsId: 1,
      _creditAmount: 1,
      _creditDays: 1,
      _rateBaseMasterId: 1,
      _stonePricing: 1,
      _chatPermissions: 1,
      _agentId: 1,
      _agentCommision: 1,
      _commisionType: 1,
      _location: 1,
      _dataGuard: 1,
      _createdUserId: 1,
      _createdAt: 1,
      _updatedUserId: 1,
      _updatedAt: 1,
      _status: 1,
    };
  }
  public deliveryHubTableLight(): Object {
    return {
      _id: 1,
      _name: 1,
    };
  }
  public deliveryHubTableMinimum(): Object {
    return {
      _id: 1,
      _name: 1,
      _code: 1,
      _createdUserId: 1,
      _citiesId: 1,
      _dataGuard: 1,

      _status: 1,
    };
  }
  public deliveryHubTableMedium(): Object {
    return {
      _id: 1,
      _name: 1,
      _code: 1,
      _citiesId: 1,
      _dataGuard: 1,
      _status: 1,
    };
  }
  public deliveryHubTableMaximum(): Object {
    return {
      _id: 1,
      _name: 1,
      _code: 1,
      _citiesId: 1,
      _dataGuard: 1,
      _createdUserId: 1,
      _createdAt: 1,
      _updatedUserId: 1,
      _updatedAt: 1,
      _status: 1,
    };
  }
  public globalGalleryTableLight(): Object {
    return {
      _id: 1,
      _docType: 1,
      _url: 1,
    };
  }
  public globalGalleryTableMinimum(): Object {
    return {
      _id: 1,
      _docType: 1,
      _globalGalleryCategoryId: 1,
      _uid: 1,
      _url: 1,
      _status: 1,
      _createdUserId: 1,
    };
  }
  public globalGalleryTableMedium(): Object {
    return {
      _id: 1,
      _name: 1,
      _globalGalleryCategoryId: 1,
      _docType: 1,
      _type: 1,
      _uid: 1,
      _url: 1,
      _status: 1,
    };
  }
  public globalGalleryTableMaximum(): Object {
    return {
      _id: 1,
      _name: 1,
      _globalGalleryCategoryId: 1,
      _docType: 1,
      _type: 1,
      _uid: 1,
      _url: 1,
      _createdUserId: 1,
      _createdAt: 1,
      _updatedUserId: 1,
      _updatedAt: 1,
      _status: 1,
    };
  }

  public userTableLight(): Object {
    return {
      _id: 1,
      _name: 1,
      _email: 1,
      _mobile: 1,
      _globalGalleryId: 1,
      _permissions: 1,
    };
  }

  public userTableMinimum(): Object {
    return {
      _id: 1,
      _name: 1,
      _gender: 1,
      _email: 1,
      _mobile: 1,
      _globalGalleryId: 1,
      _permissions: 1,
      _customType: 1,
      _createdUserId: 1,
      _status: 1,
    };
  }
  public userTableMedium(): Object {
    return {
      _id: 1,
      _name: 1,
      _gender: 1,
      _email: 1,
      _mobile: 1,
      _globalGalleryId: 1,
      _customType: 1,
      _employeeId: 1,
      _agentId: 1,
      _supplierId: 1,
      _testCenterId: 1,

      _logisticPartnerId: 1,
      _shopId: 1,
      _halmarkId: 1,
      _customerId: 1,
      _deliveryHubId: 1,
      _deviceUniqueId: 1,
      _userRole: 1,
      _status: 1,
    };
  }
  public userTableMaximum(): Object {
    return {
      _id: 1,
      _name: 1,
      _gender: 1,
      _email: 1,
      _password: 1,
      _mobile: 1,
      _globalGalleryId: 1,
      _customType: 1,
      _employeeId: 1,
      _agentId: 1,
      _supplierId: 1,
      _testCenterId: 1,
      _logisticPartnerId: 1,
      _shopId: 1,
      _halmarkId: 1,
      _customerId: 1,
      _fcmId: 1,
      _deliveryHubId: 1,
      _deviceUniqueId: 1,
      _permissions: 1,
      _userRole: 1,
      _createdUserId: 1,
      _createdAt: 1,
      _updatedUserId: 1,
      _updatedAt: 1,
      _status: 1,
    };
  }

  public deliveryTableLight(): Object {
    return {
      _id: 1,
      _uid: 1,
    };
  }
  public deliveryTableMinimum(): Object {
    return {
      _id: 1,
      _uid: 1,
      _type: 1,
      _employeeId: 1,
      _createdUserId: 1,
      _workStatus: 1,
    };
  }
  public deliveryTableMedium(): Object {
    return {
      _id: 1,
      _uid: 1,
      _type: 1,
      _workStatus: 1,
      _employeeId: 1,
      _hubId: 1,
      _shopId: 1,
      _status: 1,
    };
  }
  public deliveryTableMaximum(): Object {
    return {
      _id: 1,
      _uid: 1,
      _type: 1,
      _workStatus: 1,
      _hubId: 1,
      _shopId: 1,
      _createdAt: 1,
      _updatedUserId: 1,
      _updatedAt: 1,
      _status: 1,
    };
  }

  public orderSaleSetSubProcessTableLight(): Object {
    return {
      _id: 1,
      _orderSaleSetProcessId: 1,
      _userId: 1,
      _orderStatus: 1,
      _description: 1,
      _subProcessId: 1,
      _status: 1,
    };
  }
  public orderSaleSetSubProcessTableMinimum(): Object {
    return {
      _id: 1,
      _orderSaleSetProcessId: 1,
      _userId: 1,
      _orderStatus: 1,
      _description: 1,
      _subProcessId: 1,
      _status: 1,
    };
  }
  public orderSaleSetSubProcessTableMedium(): Object {
    return {
      _id: 1,
      _orderSaleSetProcessId: 1,
      _userId: 1,
      _orderStatus: 1,
      _description: 1,
      _subProcessId: 1,
      _status: 1,
    };
  }
  public orderSaleSetSubProcessTableMaximum(): Object {
    return {
      _id: 1,
      _orderSaleSetProcessId: 1,
      _userId: 1,
      _orderStatus: 1,
      _description: 1,
      _subProcessId: 1,
      _createdUserId: 1,
      _createdAt: 1,
      _status: 1,
    };
  }
  public subProcessMasterTableLight(): Object {
    return {
      _id: 1,
      _name: 1,
      _code: 1,
      _isAutomatic: 1,
      _maxHours: 1,
      _processMasterId: 1,
      _priority: 1,
      _createdUserId: 1,
      _status: 1,
    };
  }
  public subProcessMasterTableMinimum(): Object {
    return {
      _id: 1,
      _name: 1,
      _code: 1,

      _priority: 1,
      _createdUserId: 1,
      _status: 1,
    };
  }
  public subProcessMasterTableMedium(): Object {
    return {
      _id: 1,
      _name: 1,
      _code: 1,
      _isAutomatic: 1,
      _maxHours: 1,
      _processMasterId: 1,
      _priority: 1,
      _createdUserId: 1,
      _status: 1,
    };
  }
  public subProcessMasterTableMaximum(): Object {
    return {
      _id: 1,
      _name: 1,
      _code: 1,
      _isAutomatic: 1,
      _maxHours: 1,
      _processMasterId: 1,
      _priority: 1,
      _createdUserId: 1,
      _createdAt: 1,
      _updatedUserId: 1,
      _updatedAt: 1,
      _status: 1,
    };
  }

  public orderSaleHistoryTableLight(): Object {
    return {
      _id: 1,
      _orderSaleId: 1,
      _orderSaleItemId: 1,
      _shopId: 1,
      _userId: 1,
      _type: 1,
      _description: 1,
      _createdUserId: 1,
      _createdAt: 1,
      _status: 1,
    };
  }

  public orderSaleHistoryTableMinimum(): Object {
    return {
      _id: 1,
      _orderSaleId: 1,
      _orderSaleItemId: 1,
      _shopId: 1,
      _userId: 1,
      _type: 1,
      _description: 1,
      _createdUserId: 1,
      _createdAt: 1,
      _status: 1,
    };
  }

  public orderSaleHistoryTableMedium(): Object {
    return {
      _id: 1,
      _orderSaleId: 1,
      _orderSaleItemId: 1,
      _shopId: 1,
      _userId: 1,
      _type: 1,
      _description: 1,
      _createdUserId: 1,
      _createdAt: 1,
      _status: 1,
    };
  }

  public orderSaleHistoryTableMaximum(): Object {
    return {
      _id: 1,
      _orderSaleId: 1,
      _orderSaleItemId: 1,
      _shopId: 1,
      _userId: 1,
      _type: 1,
      _description: 1,
      _createdUserId: 1,
      _createdAt: 1,
      _status: 1,
    };
  }

  public orderSaleDocumentsTableLight(): Object {
    return {
      _orderSaleId: 1,
      _globalGalleryId: 1,
    };
  }

  public orderSaleDocumentsTableMinimum(): Object {
    return {
      _id: 1,
      _orderSaleId: 1,
      _globalGalleryId: 1,
      _status: 1,
    };
  }

  public orderSaleDocumentsTableMedium(): Object {
    return {
      _id: 1,
      _orderSaleId: 1,
      _globalGalleryId: 1,
      _createdUserId: 1,
      _status: 1,
    };
  }

  public orderSaleDocumentsTableMaximum(): Object {
    return {
      _id: 1,
      _orderSaleId: 1,
      _globalGalleryId: 1,
      _createdUserId: 1,
      _createdAt: 1,
      _updatedUserId: 1,
      _updatedAt: 1,
      _status: 1,
    };
  }

  public productTableLight(): Object {
    return {
      _id: 1,
      _name: 1,
      _barcode: 1,
      _type: 1,
      _purity: 1,
      _hmSealingStatus: 1,
      _huId: 1,
      _eCommerceStatus: 1,
      _status: 1,
    };
  }

  public productTableMinimum(): Object {
    return {


      _id: 1,
      _name: 1,
      _barcode: 1,
      _type: 1,
      _purity: 1,
      _hmSealingStatus: 1,
      _huId: 1,
      _eCommerceStatus: 1,
      _designerId: 1,
      _status: 1,
      _shopId: 1,
      _orderId: 1,
      _categoryId: 1,
      _subCategoryId: 1,
      _groupId: 1,

    };
  }

  public productTableMedium(): Object {
    return {
      _id: 1,
      _name: 1,
      _designerId: 1,
      _shopId: 1,
      _orderId: 1,
      _grossWeight: 1,
      _barcode: 1,
      _categoryId: 1,
      _subCategoryId: 1,
      _groupId: 1,
      _type: 1,
      _purity: 1,
      _hmSealingStatus: 1,
      _totalStoneWeight: 1,
      _netWeight: 1,
      _huId: 1,
      _eCommerceStatus: 1,
      _status: 1,
    };
  }

  public productTableMaximum(): Object {
    return {
      _id: 1,
      _name: 1,
      _designerId: 1,
      _shopId: 1,
      _orderId: 1,
      _grossWeight: 1,
      _barcode: 1,
      _categoryId: 1,
      _subCategoryId: 1,
      _groupId: 1,
      _type: 1,
      _purity: 1,
      _hmSealingStatus: 1,
      _totalStoneWeight: 1,
      _netWeight: 1,
      _huId: 1,
      _eCommerceStatus: 1,
      _createdUserId: 1,
      _createdAt: 1,
      _updatedUserId: 1,
      _updatedAt: 1,
      _status: 1,
    };
  }

  public categoryTableLight(): Object {
    return {
      _id:1,
      _name:1,
      _code:1,
      _status:1,
    };
  }

  public categoryTableMinimum(): Object {
    return {
      _id:1,
      _name:1,
      _code:1,
      _description:1,
      _dataGuard:1,
      _status:1,
    };
  }

  public categoryTableMedium(): Object {
    return {
      _id:1,
      _name:1,
      _code:1,
      _description:1,
      _groupId:1,
      _globalGalleryId:1,
      _dataGuard:1,
      _status:1,
    };
  }

  public categoryTableMaximum(): Object {
    return {
      _id:1,
      _name:1,
      _code:1,
      _description:1,
      _groupId:1,
      _globalGalleryId:1,
      _dataGuard:1,
      _createdUserId:1,
      _createdAt:1,
      _updatedUserId:1,
      _updatedAt:1,
      _status:1,
    };
  }
  public rootCauseTableLight(): Object {
    return {
      _id:1,
      _name:1,
     
    };
  }
  public rootCauseTableMinimumn(): Object {
    return {
      _id:1,
      _name:1,
      _type:1,
      _dataGuard:1,
      
      _status:1,
    };
  }
  public rootCauseTableMedium(): Object {
    return {
      _id:1,
      _name:1,
      _type:1,
      _dataGuard:1,
      _createdUserId:1,
      _status:1,
    };
  }
  public rootCauseTableMaximum(): Object {
    return {
      _id:1,
      _name:1,
      _type:1,
      _dataGuard:1,
      _createdUserId:1,
      _createdAt:1,
      _updatedUserId:1,
      _updatedAt:1,
      _status:1,
    };
  }
}
