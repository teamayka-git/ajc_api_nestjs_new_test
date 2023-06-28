
import * as mongoose from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { AccountPostInvoiceCreateDto, AccountPostInvoiceEditDto } from './account-post-invoice.dto';
import { GlobalConfig } from 'rxjs';
import { AccountVoucher } from 'src/tableModels/accountVoucher.model';
import { AccountVoucherItems } from 'src/tableModels/accountVoucherItems.model';
import { AccountBook } from 'src/tableModels/accountBook.model';
import { AccountOutstanding } from 'src/tableModels/accountOutstanding.model';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
//Safeer Update

@Injectable()
export class AccountPostInvoiceService {
    constructor(
        @InjectModel(ModelNames.ACCOUNT_VOUCHER)
        private readonly AccountVoucherModel: mongoose.Model<AccountVoucher>,
        @InjectModel(ModelNames.ACCOUNT_VOUCHER_ITEMS)
        private readonly AccountVoucherItemsModel: mongoose.Model<AccountVoucherItems>,
        @InjectModel(ModelNames.ACCOUNT_BOOK)
        private readonly AccountBookModel: mongoose.Model<AccountBook>,
        @InjectModel(ModelNames.ACCOUNT_OUTSTANDING)
        private readonly AccountOutstandingModel: mongoose.Model<AccountOutstanding>,
        @InjectConnection() private readonly connection: mongoose.Connection,
      ) {}

    async create(dto: AccountPostInvoiceCreateDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
        try {
          var arrayToVoucher = [];
          var arrayToVoucherItems = [];
          var arrayToAccountBook1 = [];
          var arrayToAccountBook2 = [];
          var arrayToOutstandingReceivable = [];
          console.log("______ invoice auto ______1");
          dto.array.map((mapItem) => {

            var vid = new mongoose.Types.ObjectId();

            // Voucher Head
            arrayToVoucher.push({
              _id: vid,
              _voucherNo: mapItem.invoiceNo,
              _voucherDate: mapItem.invoiceDate,
              _voucherType: 1,
              _ledgerId: mapItem.ledgerId,
              _branchId: '63f331cedcc0abe2f6d03160',
              _remarks: 'For the Invoice ' + mapItem.invoiceNo,
              _docNo: '',
              _docDate: -1,
              _crdr: -1,
              _amount: mapItem.amount,
              _postingDate: mapItem.invoiceDate,
              _allocationRequired: false,
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _updatedUserId: null,
              _updatedAt: -1,
              _status: 1,
          });
          
          console.log("______ invoice auto ______2");

         var bid = new mongoose.Types.ObjectId();

          // Customer Debit
          arrayToAccountBook1.push({
            _id: bid,
            _transactionDate: mapItem.invoiceDate,
            _voucherId: vid,
            _voucherNo: mapItem.invoiceNo,
            _voucherType: 1,
            _ledgerId: mapItem.ledgerId,
            _branchId: '63f331cedcc0abe2f6d03160',
            _description: 'For the Invoice ' + mapItem.invoiceNo,
            _currencyId: '63f33292dcc0abe2f6d03166',
            _exRate: 1,
            _crdr: -1,
            _amount: mapItem.amount,
            _total: mapItem.amount,
            _createdUserId: _userId_,
            _status: 1,
        });


        console.log("______ invoice auto ______3");
          // Outstanding Receivable
          arrayToOutstandingReceivable.push({
            _transactionDate: mapItem.invoiceDate,
            _bookId: bid,
            _voucherNo: mapItem.invoiceNo,
            _voucherType: 1,
            _branchId: '63f331cedcc0abe2f6d03160',
            _ledgerId: mapItem.ledgerId,
            _outstandingType: mapItem.isFixed,
            _rate: mapItem.rate,
            _amountMetal: mapItem.metalAmountWithGST,
            _amountStone: mapItem.stoneAmount,
            _amountStone_Rec: 0,
            _pureWeightRB: mapItem.rateBase,
            _pureWeight100: mapItem.pureWeight100,
            _pureWeight100_Rec: 0,
            _pureWeight: mapItem.pureWeight,
            _pureWeight_Rec: 0,
            _amountHM: mapItem.hmCharge,
            _amountHM_Rec: 0,
            _amountOTH: mapItem.otherCharge,
            _amountOTH_Rec: 0,
            _amountMC: mapItem.makingChargeWithGST,
            _amountMC_Rec: 0,
            _description: 'For the Invoice ' + mapItem.invoiceNo,
            _amountTotal: mapItem.amount,
            _amountTotal_Rec: 0,
            _transactionSign: 1,
            _createdUserId: _userId_,
            _createdAt: dateTime,
            _updatedUserId: null,
            _updatedAt: -1,
            _status: 1,
        });


        console.log("______ invoice auto ______4");
          var amount = mapItem.amount - (mapItem.CGST + mapItem.SGST + mapItem.IGST) - mapItem.stoneAmount - mapItem.hmCharge - mapItem.otherCharge - mapItem.roundOff;

            // Sales Income
            arrayToVoucherItems.push({
              _voucherId: vid,
              _ledgerId: '640b7fc216b60aaca1c60cae',
              _description: 'For the Invoice ' + mapItem.invoiceNo,
              _currencyId: '63f33292dcc0abe2f6d03166',
              _exRate: 1,
              _crdr: 1,
              _amount: amount,
              _total: amount,
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _updatedUserId: null,
              _updatedAt: -1,
              _status: 1,
          });

          arrayToAccountBook2.push({
            _transactionDate: mapItem.invoiceDate,
            _voucherId: vid,
            _voucherNo: mapItem.invoiceNo,
            _voucherType: 1,
            _ledgerId: '640b7fc216b60aaca1c60cae',
            _branchId: '63f331cedcc0abe2f6d03160',
            _description: 'For the Invoice ' + mapItem.invoiceNo,
            _currencyId: '63f33292dcc0abe2f6d03166',
            _exRate: 1,
            _crdr: 1,
            _amount: amount,
            _total: amount,
            _createdUserId: _userId_,
            _status: 1,
        });

        console.log("______ invoice auto ______5");

          //Stone Amount
          if(mapItem.stoneAmount > 0)
          {
              arrayToVoucherItems.push({
                _voucherId: vid,
                _ledgerId: '640f0ab5fd139b2099f374b3',
                _description: 'For the Invoice ' + mapItem.invoiceNo,
                _currencyId: '63f33292dcc0abe2f6d03166',
                _exRate: 1,
                _crdr: 1,
                _amount: mapItem.stoneAmount,
                _total: mapItem.stoneAmount,
                _createdUserId: _userId_,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
                _status: 1,
            });

            arrayToAccountBook2.push({
              _transactionDate: mapItem.invoiceDate,
              _voucherId: vid,
              _voucherNo: mapItem.invoiceNo,
              _voucherType: 1,
              _ledgerId: '640f0ab5fd139b2099f374b3',
              _branchId: '63f331cedcc0abe2f6d03160',
              _description: 'For the Invoice ' + mapItem.invoiceNo,
              _currencyId: '63f33292dcc0abe2f6d03166',
              _exRate: 1,
              _crdr: 1,
              _amount: mapItem.stoneAmount,
              _total: mapItem.stoneAmount,
              _createdUserId: _userId_,
              _status: 1,
          });

          }

            //HM Charge
            if(mapItem.hmCharge > 0)
            {
                arrayToVoucherItems.push({
                  _voucherId: vid,
                  _ledgerId: '640f0ac6fd139b2099f374b5',
                  _description: 'For the Invoice ' + mapItem.invoiceNo,
                  _currencyId: '63f33292dcc0abe2f6d03166',
                  _exRate: 1,
                  _crdr: 1,
                  _amount: mapItem.hmCharge,
                  _total: mapItem.hmCharge,
                  _createdUserId: _userId_,
                  _createdAt: dateTime,
                  _updatedUserId: null,
                  _updatedAt: -1,
                  _status: 1,
              });

              arrayToAccountBook2.push({
                _transactionDate: mapItem.invoiceDate,
                _voucherId: vid,
                _voucherNo: mapItem.invoiceNo,
                _voucherType: 1,
                _ledgerId: '640f0ac6fd139b2099f374b5',
                _branchId: '63f331cedcc0abe2f6d03160',
                _description: 'For the Invoice ' + mapItem.invoiceNo,
                _currencyId: '63f33292dcc0abe2f6d03166',
                _exRate: 1,
                _crdr: 1,
                _amount: mapItem.hmCharge,
                _total: mapItem.hmCharge,
                _createdUserId: _userId_,
                _status: 1,
            });

            }

            //Other Charge
            if(mapItem.otherCharge > 0)
            {
                arrayToVoucherItems.push({
                  _voucherId: vid,
                  _ledgerId: '640f0adcfd139b2099f374b7',
                  _description: 'For the Invoice ' + mapItem.invoiceNo,
                  _currencyId: '63f33292dcc0abe2f6d03166',
                  _exRate: 1,
                  _crdr: 1,
                  _amount: mapItem.otherCharge,
                  _total: mapItem.otherCharge,
                  _createdUserId: _userId_,
                  _createdAt: dateTime,
                  _updatedUserId: null,
                  _updatedAt: -1,
                  _status: 1,
              });

              arrayToAccountBook2.push({
                _transactionDate: mapItem.invoiceDate,
                _voucherId: vid,
                _voucherNo: mapItem.invoiceNo,
                _voucherType: 1,
                _ledgerId: '640f0adcfd139b2099f374b7',
                _branchId: '63f331cedcc0abe2f6d03160',
                _description: 'For the Invoice ' + mapItem.invoiceNo,
                _currencyId: '63f33292dcc0abe2f6d03166',
                _exRate: 1,
                _crdr: 1,
                _amount: mapItem.otherCharge,
                _total: mapItem.otherCharge,
                _createdUserId: _userId_,
                _status: 1,
            });

            }


            //Making Charge
          if(mapItem.stoneAmount > 0)
          {
              arrayToVoucherItems.push({
                _voucherId: vid,
                _ledgerId: '640f0ab5fd139b2099f374b3',
                _description: 'For the Invoice ' + mapItem.invoiceNo,
                _currencyId: '63f33292dcc0abe2f6d03166',
                _exRate: 1,
                _crdr: 1,
                _amount: mapItem.makingCharge,
                _total: mapItem.makingCharge,
                _createdUserId: _userId_,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
                _status: 1,
            });

            arrayToAccountBook2.push({
              _transactionDate: mapItem.invoiceDate,
              _voucherId: vid,
              _voucherNo: mapItem.invoiceNo,
              _voucherType: 1,
              _ledgerId: '640f0ab5fd139b2099f374b3',
              _branchId: '63f331cedcc0abe2f6d03160',
              _description: 'For the Invoice ' + mapItem.invoiceNo,
              _currencyId: '63f33292dcc0abe2f6d03166',
              _exRate: 1,
              _crdr: 1,
              _amount: mapItem.makingCharge,
              _total: mapItem.makingCharge,
              _createdUserId: _userId_,
              _status: 1,
          });

          }

             //Round - Off
             if(mapItem.roundOff != 0)
             {

                var roff = mapItem.roundOff
                var crdr = 1
                if(roff < 0)
                {
                  roff = roff * -1
                  crdr = -1
                }

                 arrayToVoucherItems.push({
                   _voucherId: vid,
                   _ledgerId: '640f0adcfd139b2099f374b7',
                   _description: 'For the Invoice ' + mapItem.invoiceNo,
                   _currencyId: '63f33292dcc0abe2f6d03166',
                   _exRate: 1,
                   _crdr: crdr,
                   _amount: roff,
                   _total: roff,
                   _createdUserId: _userId_,
                   _createdAt: dateTime,
                   _updatedUserId: null,
                   _updatedAt: -1,
                   _status: 1,
               });

               arrayToAccountBook2.push({
                _transactionDate: mapItem.invoiceDate,
                _voucherId: vid,
                _voucherNo: mapItem.invoiceNo,
                _voucherType: 1,
                _ledgerId: '640f0adcfd139b2099f374b7',
                _branchId: '63f331cedcc0abe2f6d03160',
                _description: 'For the Invoice ' + mapItem.invoiceNo,
                _currencyId: '63f33292dcc0abe2f6d03166',
                _exRate: 1,
                _crdr: crdr,
                _amount: roff,
                _total: roff,
                _createdUserId: _userId_,
                _status: 1,
            });

             }

            //CGST
            if(mapItem.CGST > 0)
            {
                arrayToVoucherItems.push({
                  _voucherId: vid,
                  _ledgerId: '640f05f0fd139b2099f374ab',
                  _description: 'For the Invoice ' + mapItem.invoiceNo,
                  _currencyId: '63f33292dcc0abe2f6d03166',
                  _exRate: 1,
                  _crdr: 1,
                  _amount: mapItem.CGST,
                  _total: mapItem.CGST,
                  _createdUserId: _userId_,
                  _createdAt: dateTime,
                  _updatedUserId: null,
                  _updatedAt: -1,
                  _status: 1,
              });

              arrayToAccountBook2.push({
                _transactionDate: mapItem.invoiceDate,
                _voucherId: vid,
                _voucherNo: mapItem.invoiceNo,
                _voucherType: 1,
                _ledgerId: '640f05f0fd139b2099f374ab',
                _branchId: '63f331cedcc0abe2f6d03160',
                _description: 'For the Invoice ' + mapItem.invoiceNo,
                _currencyId: '63f33292dcc0abe2f6d03166',
                _exRate: 1,
                _crdr: 1,
                _amount: mapItem.CGST,
                _total: mapItem.CGST,
                _createdUserId: _userId_,
                _status: 1,
            });

            }

             //SGST
             if(mapItem.SGST > 0)
             {
                 arrayToVoucherItems.push({
                   _voucherId: vid,
                   _ledgerId: '640f060efd139b2099f374ad',
                   _description: 'For the Invoice ' + mapItem.invoiceNo,
                   _currencyId: '63f33292dcc0abe2f6d03166',
                   _exRate: 1,
                   _crdr: 1,
                   _amount: mapItem.SGST,
                   _total: mapItem.SGST,
                   _createdUserId: _userId_,
                   _createdAt: dateTime,
                   _updatedUserId: null,
                   _updatedAt: -1,
                   _status: 1,
               });

               arrayToAccountBook2.push({
                _transactionDate: mapItem.invoiceDate,
                _voucherId: vid,
                _voucherNo: mapItem.invoiceNo,
                _voucherType: 1,
                _ledgerId: '640f060efd139b2099f374ad',
                _branchId: '63f331cedcc0abe2f6d03160',
                _description: 'For the Invoice ' + mapItem.invoiceNo,
                _currencyId: '63f33292dcc0abe2f6d03166',
                _exRate: 1,
                _crdr: 1,
                _amount: mapItem.SGST,
                _total: mapItem.SGST,
                _createdUserId: _userId_,
                _status: 1,
            });


             }

             //IGST
             if(mapItem.IGST > 0)
             {
                 arrayToVoucherItems.push({
                   _voucherId: vid,
                   _ledgerId: '640f0619fd139b2099f374af',
                   _description: 'For the Invoice ' + mapItem.invoiceNo,
                   _currencyId: '63f33292dcc0abe2f6d03166',
                   _exRate: 1,
                   _crdr: 1,
                   _amount: mapItem.IGST,
                   _total: mapItem.IGST,
                   _createdUserId: _userId_,
                   _createdAt: dateTime,
                   _updatedUserId: null,
                   _updatedAt: -1,
                   _status: 1,
               });


               arrayToAccountBook2.push({
                _transactionDate: mapItem.invoiceDate,
                _voucherId: vid,
                _voucherNo: mapItem.invoiceNo,
                _voucherType: 1,
                _ledgerId: '640f0619fd139b2099f374af',
                _branchId: '63f331cedcc0abe2f6d03160',
                _description: 'For the Invoice ' + mapItem.invoiceNo,
                _currencyId: '63f33292dcc0abe2f6d03166',
                _exRate: 1,
                _crdr: 1,
                _amount: mapItem.IGST,
                _total: mapItem.IGST,
                _createdUserId: _userId_,
                _status: 1,
            });


             }



          });
          console.log("______ invoice auto ______6");
          var result1 = await this.AccountVoucherModel.insertMany(arrayToVoucher, {
            session: transactionSession,
          });

          var result2 = await this.AccountVoucherItemsModel.insertMany(arrayToVoucherItems, {
            session: transactionSession,
          });

          var result3 = await this.AccountBookModel.insertMany(arrayToAccountBook1, {
            session: transactionSession,
          });

          var result4 = await this.AccountOutstandingModel.insertMany(arrayToOutstandingReceivable, {
            session: transactionSession,
          });

          console.log("______ invoice auto ______7");
          var result5 = await this.AccountBookModel.insertMany(arrayToAccountBook2, {
            session: transactionSession,
          });
    
          console.log("______ invoice auto ______8");
          const responseJSON = { message: 'success', data: { list: result1 } };
        
          await transactionSession.commitTransaction();
          await transactionSession.endSession();
          return responseJSON;
        } catch (error) {
          await transactionSession.abortTransaction();
          await transactionSession.endSession();
          throw error;
        }
      }

      async edit(dto: AccountPostInvoiceEditDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
        try {
          var result = await this.AccountVoucherModel.findOneAndUpdate(
            {
              _voucherNo: dto.invoiceNo,
              _voucherType: 1,
            },
            {
              $set: {
                _voucherDate: dto.invoiceDate,
                _ledgerId: dto.ledgerId,
                _branchId: '63f331cedcc0abe2f6d03160',
                _amount: dto.amount,
                _updatedUserId: _userId_,
                _updatedAt: dateTime,
              },
            },
            { new: true, session: transactionSession },
          );
    
          const responseJSON = { message: 'success', data: result };
          
          await transactionSession.commitTransaction();
          await transactionSession.endSession();
          return responseJSON;
        } catch (error) {
          await transactionSession.abortTransaction();
          await transactionSession.endSession();
          throw error;
        }
      }

      



}
