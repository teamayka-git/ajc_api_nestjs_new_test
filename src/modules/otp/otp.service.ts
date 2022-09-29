import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOtp } from './otp.dto';

import * as mongoose from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import { Otp } from 'src/tableModels/otp.model';
import { GlobalConfig } from 'src/config/global_config';
import { User } from 'src/tableModels/user.model';
import { StringUtils } from 'src/utils/string_utils';
import { SmsUtils } from 'src/utils/smsUtils';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(ModelNames.OTP)
    private readonly otpModel: mongoose.Model<Otp>,
    @InjectModel(ModelNames.USER)
    private readonly userModel: mongoose.Model<User>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async create(dto: CreateOtp) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var smsGatewayArray = [];
      var userDataCheck = await this.userModel.find({
        _mobile: dto.mobile,
        _status: 1,
      });

      if (userDataCheck.length == 0) {
        throw new HttpException(
          'Mobile not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.otpModel.updateMany(
        {
          _status: 1,
          _type: 0,
        },
        {
          $set: {
            _status: 0,
          },
        },
        { new: true, session: transactionSession },
      );

      var otpValue = new StringUtils().makeid(4);
      const otpTable = new this.otpModel({
        _type: 0,
        _otp: otpValue,
        _userId: userDataCheck[0]._id,
        _createdAt: dateTime,
        _status: 1,
      });
      var resultOtp = await otpTable.save({
        session: transactionSession,
      });
      smsGatewayArray.push({
        mobile: dto.mobile,
        text: otpValue ,
        userName:userDataCheck[0]._name
      });

      const responseJSON = { message: 'success', data: resultOtp };
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

      if (smsGatewayArray.length != 0) {
        smsGatewayArray.forEach((elementSmsGateway) => {
          new SmsUtils().sendSmsSMSBits(
            elementSmsGateway.mobile,
            elementSmsGateway.text,elementSmsGateway.userName
          );
        });
      }

      return responseJSON;
    } catch (error) {
      await transactionSession.abortTransaction();
      await transactionSession.endSession();
      throw error;
    }
  }
}
