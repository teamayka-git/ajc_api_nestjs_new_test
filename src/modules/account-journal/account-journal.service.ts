import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { AccountJournal } from 'src/tableModels/accountJournal.model';
import { AccountJournalCreateDto, AccountJournalListDto, AccountJournalStatusChangeDto } from './account-journal.dto';
import { JournalTransactions } from 'src/tableModels/accountJournalTransactions.model';
import { GlobalConfig } from 'src/config/global_config';

//Safeer Update

@Injectable()
export class AccountJournalService {
    constructor(
        @InjectModel(ModelNames.ACCOUNT_JOURNAL)
        private readonly AccountJournalModel: mongoose.Model<AccountJournal>,
        @InjectModel(ModelNames.ACCOUNT_JOURNAL_ITEMS)
        private readonly AccountJournalItemsModel: mongoose.Model<JournalTransactions>,
        @InjectConnection() private readonly connection: mongoose.Connection,
      ) {}

      async create(dto: AccountJournalCreateDto, _userId_: string) {
        var dateTime = new Date().getTime();
        const transactionSession = await this.connection.startSession();
        transactionSession.startTransaction();
        try {
    
          var arrayToDeliveryChallan = [];
          var arrayToDeliveryChallanItems = [];
    
    
          dto.AccountJournals.map((mapItem, index) => {
            var AccountJournalId = new mongoose.Types.ObjectId();
    
    
            arrayToDeliveryChallan.push({
              _id: AccountJournalId,
              _branchId: mapItem.branchId,
              _remarks: mapItem.remarks,
              _voucherNo: mapItem.voucherNo,
              _voucherDate: mapItem.voucherDate,
              _postingDate:mapItem.postingDate,
              _createdUserId: _userId_,
              _createdAt: dateTime,
              _updatedUserId: null,
              _updatedAt: -1,
              _status: 1,
            });
    
            mapItem.arrayAccountJournalItems.map((mapItem1) => {          
              
              var AccountJournalDetailId = new mongoose.Types.ObjectId();
    
              arrayToDeliveryChallanItems.push({
                _id: AccountJournalDetailId,
                _journalId: AccountJournalId,
                _ledgerId: mapItem1.ledgerId,
                _description: mapItem1.description,
                _currencyId: mapItem1.currencyId,
                _exRate: mapItem1.exRate,
                _crdr:mapItem1.crdr,
                _amount: mapItem1.amount,
                _total: mapItem1.total,
                _createdUserId: _userId_,
                _createdAt: dateTime,
                _updatedUserId: null,
                _updatedAt: -1,
                _status: 1,
              });
            });
    
        });
    
    
console.log("___arrayToDeliveryChallan     "+JSON.stringify(arrayToDeliveryChallan));
console.log("___arrayToDeliveryChallanItems    "+JSON.stringify(arrayToDeliveryChallanItems));


          var result1 = await this.AccountJournalModel.insertMany(arrayToDeliveryChallan, {
            session: transactionSession,
          });
          await this.AccountJournalItemsModel.insertMany(arrayToDeliveryChallanItems, {
            session: transactionSession,
          });
    
          const responseJSON = { message: 'success', data: { list: result1 } };
          if (
            process.env.RESPONSE_RESTRICT == 'true' &&
            JSON.stringify(responseJSON).length >=
              GlobalConfig().RESPONSE_RESTRICT_DEFAULT_COUNT
          ) {
            throw new HttpException(
              GlobalConfig().RESPONSE_RESTRICT_RESPONSE +
                JSON.stringify(responseJSON).length,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
          await transactionSession.commitTransaction();
          await transactionSession.endSession();
          return responseJSON;
        } catch (error) {
          await transactionSession.abortTransaction();
          await transactionSession.endSession();
          throw error;
        }
      }

//       async edit(dto: AccountJournalListDto, _userId_: string) {
//         var dateTime = new Date().getTime();
//         const transactionSession = await this.connection.startSession();
//         transactionSession.startTransaction();
//         try {
//           var result = await this.AccountJournalModel.findOneAndUpdate(
//             {
//               _id: dto.AccountJournalId,
//             },
//             {
//               $set: {
//                 _code: dto.code,
//                 _name: dto.name,
//                 _crdr: dto.crdr,
//                 _updatedUserId: _userId_,
//                 _updatedAt: dateTime,
//               },
//             },
//             { new: true, session: transactionSession },
//           );
    
//           const responseJSON = { message: 'success', data: result };
          
//           await transactionSession.commitTransaction();
//           await transactionSession.endSession();
//           return responseJSON;
//         } catch (error) {
//           await transactionSession.abortTransaction();
//           await transactionSession.endSession();
//           throw error;
//         }
//       }

      
//   async status_change(dto: AccountJournalStatusChangeDto, _userId_: string) {
//     var dateTime = new Date().getTime();
//     const transactionSession = await this.connection.startSession();
//     transactionSession.startTransaction();
//     try {
//       var result = await this.AccountJournalModel.updateMany(
//         {
//           _id: { $in: dto.AccountJournalIds },
//         },
//         {
//           $set: {
//             _updatedUserId: _userId_,
//             _updatedAt: dateTime,
//             _status: dto.status,
//           },
//         },
//         { new: true, session: transactionSession },
//       );

//       const responseJSON = { message: 'success', data: result };

//       await transactionSession.commitTransaction();
//       await transactionSession.endSession();
//       return responseJSON;
//     } catch (error) {
//       await transactionSession.abortTransaction();
//       await transactionSession.endSession();
//       throw error;
//     }
//   }

//   async list(dto: AccountJournalListDto) {
//     var dateTime = new Date().getTime();
//     const transactionSession = await this.connection.startSession();
//     transactionSession.startTransaction();
//     try {
//       var arrayAggregation = [];

//       if (dto.searchingText != '') {
//         //todo
//         arrayAggregation.push({
//           $match: {
//             $or: [{ _name: new RegExp(dto.searchingText, 'i') }],
//           },
//         });
//       }
//       if (dto.AccountJournalIds.length > 0) {
//         var newSettingsId = [];
//         dto.AccountJournalIds.map((mapItem) => {
//           newSettingsId.push(new mongoose.Types.ObjectId(mapItem));
//         });
//         arrayAggregation.push({ $match: { _id: { $in: newSettingsId } } });
//       }
//       arrayAggregation.push({ $match: { _status: { $in: dto.statusArray } } });
//       switch (dto.sortType) {
//         case 0:
//           arrayAggregation.push({ $sort: { _id: dto.sortOrder } });
//           break;
//         case 1:
//           arrayAggregation.push({ $sort: { _status: dto.sortOrder ,_id: dto.sortOrder } });
//           break;
//         case 2:
//           arrayAggregation.push({ $sort: { _name: dto.sortOrder  ,_id: dto.sortOrder} });
//           break;
//         case 3:
//           arrayAggregation.push({ $sort: { _purity: dto.sortOrder ,_id: dto.sortOrder } });
//           break;
//       }

//       if (dto.skip != -1) {
//         arrayAggregation.push({ $skip: dto.skip });
//         arrayAggregation.push({ $limit: dto.limit });
//       }

//       var result = await this.AccountJournalModel
//         .aggregate(arrayAggregation)
//         .session(transactionSession);

//       var totalCount = 0;
//       if (dto.screenType.includes(0)) {
//         //Get total count
//         var limitIndexCount = arrayAggregation.findIndex(
//           (it) => it.hasOwnProperty('$limit') === true,
//         );
//         if (limitIndexCount != -1) {
//           arrayAggregation.splice(limitIndexCount, 1);
//         }
//         var skipIndexCount = arrayAggregation.findIndex(
//           (it) => it.hasOwnProperty('$skip') === true,
//         );
//         if (skipIndexCount != -1) {
//           arrayAggregation.splice(skipIndexCount, 1);
//         }
//         arrayAggregation.push({
//           $group: { _id: null, totalCount: { $sum: 1 } },
//         });

//         var resultTotalCount = await this.AccountJournalModel
//           .aggregate(arrayAggregation)
//           .session(transactionSession);
//         if (resultTotalCount.length > 0) {
//           totalCount = resultTotalCount[0].totalCount;
//         }
//       }

//       const responseJSON = {
//         message: 'success',
//         data: { list: result, totalCount: totalCount },
//       };
      
//       await transactionSession.commitTransaction();
//       await transactionSession.endSession();
//       return responseJSON;
//     } catch (error) {
//       await transactionSession.abortTransaction();
//       await transactionSession.endSession();
//       throw error;
//     }
//   }

//   async checkNameExisting(dto: CheckNameExistDto) {
//     var dateTime = new Date().getTime();
//     const transactionSession = await this.connection.startSession();
//     transactionSession.startTransaction();
//     try {
//       var resultCount = await this.AccountJournalModel
//         .count({
//           _name: dto.value,
//           _id: { $nin: dto.existingIds },
//           _status: { $in: [1, 0] },
//         })
//         .session(transactionSession);

//       const responseJSON = {
//         message: 'success',
//         data: { count: resultCount },
//       };
      
//       await transactionSession.commitTransaction();
//       await transactionSession.endSession();
//       return responseJSON;
//     } catch (error) {
//       await transactionSession.abortTransaction();
//       await transactionSession.endSession();
//       throw error;
//     }
//   }


}
