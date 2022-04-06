import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModelNames } from 'src/common/model_names';
import { Products } from 'src/tableModels/products.model';
import * as mongoose from 'mongoose';
import { CitiesCreateDto } from './products.dto';
import { GlobalConfig } from 'src/config/global_config';
import { Counters } from 'src/tableModels/counters.model';
import { StringUtils } from 'src/utils/string_utils';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(ModelNames.PRODUCTS)
    private readonly productModel: Model<Products>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: Model<Counters>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async create(dto: CitiesCreateDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var arrayToProducts = [];

      var resultCounterProducts = await this.counterModel.findOneAndUpdate(
        { _tableName: ModelNames.GLOBAL_GALLERIES },
        {
          $inc: {
            _count: dto.productArray.length,
          },
        },
        { new: true, session: transactionSession },
      );
      //resultCounterProducts._count - dto.array.length + (i + 1)

      dto.productArray.map((mapItem, index) => {
        var autoIncrementNumber =
          resultCounterProducts._count - dto.productArray.length + (index + 1);

        var arrayStones = [];
        mapItem.stonesArray.map((mapItem1) => {
          arrayStones.push({
            _stoneId: mapItem1.stoneId,
            _stoneWeight: mapItem1.stoneWeight,
            _quantity: mapItem1.quantity,
          });
        });

        arrayToProducts.push({
          _name: mapItem.name,
          _designerId: `${mapItem.subCategoryCode}-${autoIncrementNumber}`,
          _customerId: mapItem.customerId,
          _orderId: mapItem.orderId,
          _grossWeight: mapItem.grossWeight,
          _stones: arrayStones,
          _barcode: new StringUtils().intToDigitString(autoIncrementNumber, 12),
          _categoryId: mapItem.categoryId,
          _subCategoryId: mapItem.subCategoryId,
          _groupId: mapItem.groupId,
          _type: mapItem.type,
          _purity: mapItem.purity,
          _hmSealingStatus: mapItem.hmSealingStatus,
          _huId: '',
          _eCommerceStatus: mapItem.eCommerceStatus,
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      });

      var result1 = await this.productModel.insertMany(arrayToProducts, {
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
}
