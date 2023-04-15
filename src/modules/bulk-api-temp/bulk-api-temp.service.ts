import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ModelNames } from 'src/common/model_names';
import * as mongoose from 'mongoose';
import { GlobalConfig } from 'src/config/global_config';
import { User } from 'src/tableModels/user.model';
import { States } from 'src/tableModels/states.model';
import { Districts } from 'src/tableModels/districts.model';
import { Cities } from 'src/tableModels/cities.model';
import { Counters } from 'src/tableModels/counters.model';
import { Branch } from 'src/tableModels/branch.model';
import { Departments } from 'src/tableModels/departments.model';
import { RateBaseMaster } from 'src/tableModels/rateBaseMasters.model';
import { TdsMasters } from 'src/tableModels/tdsMasters.model';
import { TcsMasters } from 'src/tableModels/tcsMasters.model';
import { RateCards } from 'src/tableModels/rateCards.model';
import { RateCardPercentages } from 'src/tableModels/rateCardPercentages.model';
import { SubCategories } from 'src/tableModels/sub_categories.model';
import { Employee } from 'src/tableModels/employee.model';
import { BranchBulkDataDto, CityBulkDataDto, DepartmentBulkDataDto, DistrictBulkDataDto, EmployeesBulkDataDto, RatebaseMasterBulkDataDto, RatecardBulkDataDto, ShopBulkDataDto, StateBulkDataDto, TdsTcsMasterBulkDataDto } from './bulk_api_temp.dto';
import { Shops } from 'src/tableModels/shops.model';
import { Company } from 'src/tableModels/companies.model';
import { AccountLedger } from 'src/tableModels/accountLedger.model';
import { AccountSubgroup } from 'src/tableModels/accountSubgroup.model';

const crypto = require('crypto');

@Injectable()
export class BulkApiTempService {
  constructor(
    @InjectModel(ModelNames.SHOPS)
    private readonly shopModel: mongoose.Model<Shops>,
    @InjectModel(ModelNames.EMPLOYEES)
    private readonly employeeModel: mongoose.Model<Employee>,
    @InjectModel(ModelNames.SUB_CATEGORIES)
    private readonly subCategoryModel: mongoose.Model<SubCategories>,
    @InjectModel(ModelNames.RATE_CARDS)
    private readonly ratecardModel: mongoose.Model<RateCards>,
    @InjectModel(ModelNames.RATE_CARD_PERCENTAGESS)
    private readonly ratecardPercentageModel: mongoose.Model<RateCardPercentages>,
    @InjectModel(ModelNames.RATE_BASE_MASTERS)
    private readonly ratebaseMasterModel: mongoose.Model<RateBaseMaster>,
    @InjectModel(ModelNames.DEPARTMENT)
    private readonly departmentModel: mongoose.Model<Departments>,
    @InjectModel(ModelNames.BRANCHES)
    private readonly branchModel: mongoose.Model<Branch>,
    @InjectModel(ModelNames.COUNTERS)
    private readonly counterModel: mongoose.Model<Counters>,
    @InjectModel(ModelNames.USER)
    private readonly userModel: mongoose.Model<User>,
    @InjectModel(ModelNames.CITIES)
    private readonly cityModel: mongoose.Model<Cities>,
    @InjectModel(ModelNames.DISTRICTS)
    private readonly districtModel: mongoose.Model<Districts>,
    @InjectModel(ModelNames.STATES)
    private readonly stateModel: mongoose.Model<States>,
    @InjectModel(ModelNames.TDS_MASTERS)
    private readonly tdsModel: mongoose.Model<TdsMasters>,
    @InjectModel(ModelNames.TCS_MASTERS)
    private readonly tcsModel: mongoose.Model<TcsMasters>,
    @InjectModel(ModelNames.COMPANIES)
    private readonly companyModel: mongoose.Model<Company>,
    
    @InjectModel(ModelNames.ACCOUNT_LEDGER)
    private readonly accountLedgerModel: mongoose.Model<AccountLedger>,
    @InjectModel(ModelNames.ACCOUNT_SUBGROUP)
    private readonly accountSubGroupModel: mongoose.Model<AccountSubgroup>,

    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async create(_userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      const responseJSON = { message: 'success', data: {} };
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

  async stateCreate(dto: StateBulkDataDto,_userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      // var listStates = [];
      // listStates = [
      //   // {"Name":"KERALA","Code":"1"},
      //   { Name: 'TAMILNADU', Code: '2' },
      //   { Name: 'KARNATAKA', Code: '3' },
      //   { Name: 'ANDRAPRADESH', Code: '4' },
      //   { Name: 'GOA', Code: '5' },
      //   { Name: 'MADHYAPRADESH', Code: '6' },
      //   { Name: 'MAHARASHTRA', Code: '7' },
      // ];

      const resultArray = dto.items.map((element) => {
        const { Name: _name } = element;
        const { Code: _code } = element;

        return {
          _name,
          _code: Number(_code),
          _dataGuard: [1, 2],
          _createdUserId: null,
          _createdAt: 0,
          _updatedUserId: null,
          _updatedAt: 0,
          _status: 1,
        };
      });

      var result1 = await this.stateModel.insertMany(resultArray, {
        session: transactionSession,
      });

      const responseJSON = { message: 'success', data: { list: resultArray } };
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
  async districtCreate(dto: DistrictBulkDataDto,_userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var listStates = await this.stateModel.find();
      // console.log('state list ' + JSON.stringify(listStates));
      // var listDistrict = [
      //   { Name: 'THIRUVANANTHAPURAM', Code: '1', State: 'KERALA' },
      //   { Name: 'KOLLAM', Code: '2', State: 'KERALA' },
      //   { Name: 'PATHANAMTHITTA', Code: '3', State: 'KERALA' },
      //   { Name: 'ALAPPUZHA', Code: '4', State: 'KERALA' },
      //   { Name: 'KOTTAYAM', Code: '5', State: 'KERALA' },
      //   { Name: 'IDUKKI', Code: '6', State: 'KERALA' },
      //   { Name: 'ERNAKULAM', Code: '7', State: 'KERALA' },
      //   { Name: 'THRISSUR', Code: '8', State: 'KERALA' },
      //   { Name: 'PALAKKAD', Code: '9', State: 'KERALA' },
      //   // {"Name":"MALAPPURAM","Code":"10","State":"KERALA"},
      //   { Name: 'KOZHIKKODE', Code: '11', State: 'KERALA' },
      //   { Name: 'WAYANAD', Code: '12', State: 'KERALA' },
      //   { Name: 'KANNUR', Code: '13', State: 'KERALA' },
      //   { Name: 'KASARAGODE', Code: '14', State: 'KERALA' },
      //   { Name: 'CHENNAI', Code: '15', State: 'TAMILNADU' },
      //   { Name: 'COIMBATORE', Code: '16', State: 'TAMILNADU' },
      //   { Name: 'ERODE', Code: '17', State: 'TAMILNADU' },
      //   { Name: 'MADURAI', Code: '18', State: 'TAMILNADU' },
      //   { Name: 'KANYAKUMARI', Code: '19', State: 'TAMILNADU' },
      //   { Name: 'THIRUCHIRAPALLI', Code: '20', State: 'TAMILNADU' },
      //   { Name: 'TIRUPUR', Code: '21', State: 'TAMILNADU' },
      //   { Name: 'SALEM', Code: '22', State: 'TAMILNADU' },
      //   { Name: 'MUMBAI', Code: '23', State: 'MAHARASHTRA' },
      //   { Name: 'NTR', Code: '24', State: 'ANDRAPRADESH' },
      // ];

      const resultArray = dto.items.map((element) => {
        const { Name: _name } = element;
        const { Code: _code } = element;

        var countIndex = listStates.findIndex(
          (it) => it._name == element.State,
        );

        return {
          _name,
          _code: Number(_code),
          _statesId: listStates[countIndex]._id,
          _dataGuard: [1, 2],
          _createdUserId: null,
          _createdAt: 0,
          _updatedUserId: null,
          _updatedAt: 0,
          _status: 1,
        };
      });

      var result1 = [];
      result1 = await this.districtModel.insertMany(resultArray, {
        session: transactionSession,
      });

      const responseJSON = { message: 'success', data: { list: resultArray } };
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
  async cityCreate(dto: CityBulkDataDto,_userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      var listStates = await this.districtModel.find();
      // console.log('state list ' + JSON.stringify(listStates));
      // var listDistrict = [
      //   // {"Name":"MALAPPURAM","Code":"1","District":"MALAPPURAM"},
      //   { Name: 'EDAPPAL', Code: '2', District: 'MALAPPURAM' },
      //   { Name: 'CHANGARAMKULAM', Code: '3', District: 'MALAPPURAM' },
      //   { Name: 'CALICUT', Code: '4', District: 'KOZHIKKODE' },
      //   { Name: 'KONDOTTY', Code: '5', District: 'MALAPPURAM' },
      //   { Name: 'KODUVALLY', Code: '6', District: 'MALAPPURAM' },
      //   { Name: 'PUTHANATHANI', Code: '7', District: 'MALAPPURAM' },
      //   { Name: 'KOTTAKKAL', Code: '8', District: 'MALAPPURAM' },
      //   { Name: 'VENGARA', Code: '9', District: 'MALAPPURAM' },
      //   { Name: 'VALANCHERY', Code: '10', District: 'MALAPPURAM' },
      //   { Name: 'RAMANATTUKARA', Code: '11', District: 'KOZHIKKODE' },
      //   { Name: 'KASARAGOD', Code: '12', District: 'KASARAGODE' },
      //   { Name: 'THRISSUR', Code: '13', District: 'THRISSUR' },
      //   { Name: 'CHEMMAD', Code: '14', District: 'MALAPPURAM' },
      //   { Name: 'PERINTHALMANNA', Code: '15', District: 'MALAPPURAM' },
      //   { Name: 'PATTAMBI', Code: '16', District: 'PALAKKAD' },
      //   { Name: 'FEROKE', Code: '17', District: 'KOZHIKKODE' },
      //   { Name: 'ERANAKULAM', Code: '18', District: 'ERNAKULAM' },
      //   { Name: 'TIRUR', Code: '19', District: 'MALAPPURAM' },
      //   { Name: 'TAMIL NADU', Code: '20', District: 'CHENNAI' },
      //   { Name: 'KANNUR', Code: '21', District: 'KANNUR' },
      //   { Name: 'KARUNAGAPPALLY', Code: '22', District: 'KOLLAM' },
      //   { Name: 'KAYAMKULAM', Code: '23', District: 'ALAPPUZHA' },
      //   { Name: 'KOTTARAKKARA', Code: '24', District: 'KOLLAM' },
      //   { Name: 'KUNDARA', Code: '25', District: 'KOLLAM' },
      //   { Name: 'CHANGANASSERY', Code: '26', District: 'KOTTAYAM' },
      //   { Name: 'KOLLAM', Code: '27', District: 'KOLLAM' },
      //   { Name: 'KADAKKAL', Code: '28', District: 'KOLLAM' },
      //   { Name: 'ATTINGAL', Code: '29', District: 'KOLLAM' },
      //   { Name: 'POTHENCODE', Code: '30', District: 'THIRUVANANTHAPURAM' },
      //   { Name: 'PALLICKAL', Code: '31', District: 'THIRUVANANTHAPURAM' },
      //   { Name: 'MAVELIKKARA', Code: '32', District: 'ALAPPUZHA' },
      //   { Name: 'PUNALUR', Code: '33', District: 'KOLLAM' },
      //   { Name: 'PADAPPANAL', Code: '34', District: 'KOLLAM' },
      //   { Name: 'WAYANAD', Code: '35', District: 'WAYANAD' },
      //   {
      //     Name: 'THIRUVANANTHAPURAM',
      //     Code: '36',
      //     District: 'THIRUVANANTHAPURAM',
      //   },
      //   { Name: 'MANJERI', Code: '37', District: 'MALAPPURAM' },
      //   { Name: 'PARAVOOR', Code: '38', District: 'KOLLAM' },
      //   { Name: 'VIJAYAWADA', Code: '39', District: 'NTR' },
      //   { Name: 'PONNANI', Code: '40', District: 'MALAPPURAM' },
      //   { Name: 'KUNNAMKULAM', Code: '41', District: 'THRISSUR' },
      //   { Name: 'ANCHAL', Code: '42', District: 'KOLLAM' },
      //   { Name: 'OTTAPPALAM', Code: '43', District: 'PALAKKAD' },
      //   { Name: 'PARAPPANANGADI', Code: '44', District: 'MALAPPURAM' },
      //   { Name: 'KOTTIYAM', Code: '45', District: 'KOLLAM' },
      //   { Name: 'OTHUKKUNGAL', Code: '46', District: 'MALAPPURAM' },
      //   { Name: 'TANUR', Code: '47', District: 'MALAPPURAM' },
      //   { Name: 'KUNNUMPURAM', Code: '48', District: 'MALAPPURAM' },
      //   { Name: 'THENJIPALAM', Code: '49', District: 'MALAPPURAM' },
      //   { Name: 'AMBALAPUZHA', Code: '50', District: 'ALAPPUZHA' },
      //   { Name: 'KOTTAYAM', Code: '51', District: 'KOTTAYAM' },
      //   { Name: 'PANDIKKAD', Code: '52', District: 'MALAPPURAM' },
      //   { Name: 'PALAKKAD', Code: '53', District: 'PALAKKAD' },
      //   { Name: 'MADURAI', Code: '54', District: 'MADURAI' },
      //   { Name: 'TIRUPPUR', Code: '55', District: 'TIRUPUR' },
      //   { Name: 'MUMBAI', Code: '56', District: 'MUMBAI' },
      //   { Name: 'ARAKKINAR', Code: '57', District: 'KOZHIKKODE' },
      //   { Name: 'MUKKAM', Code: '58', District: 'KOZHIKKODE' },
      //   { Name: 'KOYILANDY', Code: '59', District: 'KOZHIKKODE' },
      //   { Name: 'NEDUMANGADU', Code: '60', District: 'THIRUVANANTHAPURAM' },
      //   { Name: 'NEYYATTINKARA', Code: '61', District: 'THIRUVANANTHAPURAM' },
      //   { Name: 'PATHANAPURAM', Code: '62', District: 'KOLLAM' },
      //   { Name: 'KADAPPADY', Code: '63', District: 'MALAPPURAM' },
      //   { Name: 'KOLATHUR', Code: '64', District: 'MALAPPURAM' },
      // ];

      const resultArray = dto.items.map((element) => {
        const { Name: _name } = element;
        const { Code: _code } = element;

        var countIndex = listStates.findIndex(
          (it) => it._name == element.District,
        );

        return {
          _name,
          _code: Number(_code),
          _districtsId: listStates[countIndex]._id,
          _dataGuard: [1, 2],
          _createdUserId: null,
          _createdAt: 0,
          _updatedUserId: null,
          _updatedAt: 0,
          _status: 1,
        };
      });

      var result1 = [];
      result1 = await this.cityModel.insertMany(resultArray, {
        session: transactionSession,
      });

      const responseJSON = { message: 'success', data: { list: resultArray } };
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

  async branchCreate(dto: BranchBulkDataDto,_userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      // var listStates = [];

      // listStates = [
      //   {
      //     Name: 'KOLLAM',
      //     Code: '1',
      //     Email: 'info.ajcastings@gmail.com',
      //     Mobile: '7356428916',
      //   },
      //   {
      //     Name: 'CALICUT',
      //     Code: '2',
      //     Email: 'ajcjewelclt@gmail.com',
      //     Mobile: '7591916008',
      //   },
      //   {
      //     Name: 'ERNAKULAM',
      //     Code: '3',
      //     Email: 'ajcjewelekm@gmail.com',
      //     Mobile: '9072103916',
      //   },
      //   {
      //     Name: 'INKEL',
      //     Code: '4',
      //     Email: 'ajcjewel@gmail.com',
      //     Mobile: '9961916004',
      //   },
      //   {
      //     Name: 'THRISSUR',
      //     Code: '5',
      //     Email: 'ajcjewel1@gmail.com',
      //     Mobile: '9961916004',
      //   },
      // ];
      var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
        { _tableName: ModelNames.BRANCHES },
        {
          $inc: {
            _count: dto.items.length,
          },
        },
        { new: true, session: transactionSession },
      );
      const resultArray = dto.items.map((element, index) => {
        const { Name: _name } = element;

        return {
          _name,
          _uid: resultCounterPurchase._count - dto.items.length + index + 1,
          _email: element.Email,
          _mobile: element.Mobile,
          _globalGalleryId: null,
          _tectCode: element.Code,
          _dataGuard: [1, 2],
          _createdUserId: null,
          _createdAt: 0,
          _updatedUserId: null,
          _updatedAt: 0,
          _status: 1,
        };
      });

      var result1 = await this.branchModel.insertMany(resultArray, {
        session: transactionSession,
      });

      const responseJSON = { message: 'success', data: { list: resultArray } };
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

  async departmentCreate(dto: DepartmentBulkDataDto,_userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      // var listStates = [];
      // listStates = [
      //   {
      //     Name: 'SALES DIRECTOR',
      //     Code: '2000',
      //     Prefix: 'RELATIONSHIP MANAGER',
      //     field4: '',
      //   },
      //   {
      //     Name: 'MARKETING DIRECTOR',
      //     Code: '2001',
      //     Prefix: 'RELATIONSHIP MANAGER',
      //     field4: '',
      //   },
      //   {
      //     Name: 'ORDER DIRECTOR',
      //     Code: '2002',
      //     Prefix: 'ORDER HEAD',
      //     field4: '',
      //   },
      //   { Name: 'DIRECTOR', Code: '2003', Prefix: 'PRODUCTION', field4: '' },
      //   {
      //     Name: 'DIRECTOR1',
      //     Code: '2004',
      //     Prefix: 'HR',
      //     field4: 'duplicate data updated',
      //   },
      //   {
      //     Name: 'SALES EXECUTIVE',
      //     Code: '2005',
      //     Prefix: 'RELATIONSHIP MANAGER',
      //     field4: '',
      //   },
      //   {
      //     Name: 'BRANCH MANAGER',
      //     Code: '2006',
      //     Prefix: 'RELATIONSHIP MANAGER',
      //     field4: '',
      //   },
      //   {
      //     Name: 'ASSISTANT BRACH MANAGER',
      //     Code: '2007',
      //     Prefix: 'RELATIONSHIP MANAGER',
      //     field4: '',
      //   },
      //   {
      //     Name: 'ORDER CONTROLLER',
      //     Code: '2008',
      //     Prefix: 'ORDER HEAD',
      //     field4: '',
      //   },
      //   {
      //     Name: 'ASSISTANT ORDER CONTROLLER',
      //     Code: '2009',
      //     Prefix: 'AOC',
      //     field4: '',
      //   },
      //   {
      //     Name: 'ACCOUNTS MANAGER',
      //     Code: '2010',
      //     Prefix: 'STATUTORY',
      //     field4: '',
      //   },
      //   {
      //     Name: 'ACCOUNTS MANAGER1',
      //     Code: '2011',
      //     Prefix: 'OPERATIONS',
      //     field4: 'duplicate data updated',
      //   },
      //   { Name: 'SUPERVISOR', Code: '2012', Prefix: 'PRODUCTION', field4: '' },
      //   {
      //     Name: 'MANAGER',
      //     Code: '2013',
      //     Prefix: 'RELATIONSHIP MANAGER',
      //     field4: '',
      //   },
      // ];

      const resultArray = dto.items.map((element) => {
        const { Name: _name } = element;
        const { Code: _code } = element;

        return {
          _name,
          _code: Number(_code),
          _prefix: element.Prefix,
          _processMasterStatus: 1,
          _permissions: [],
          _dataGuard: [1, 2],
          _createdUserId: null,
          _createdAt: 0,
          _updatedUserId: null,
          _updatedAt: 0,
          _status: 1,
        };
      });

      var result1 = await this.departmentModel.insertMany(resultArray, {
        session: transactionSession,
      });

      const responseJSON = { message: 'success', data: { list: resultArray } };
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

  async rateBaseMaster(dto: RatebaseMasterBulkDataDto,_userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      // var listStates = [{ Name: '99.5' }];

      const resultArray = dto.items.map((element) => {
        const { Name: _name } = element;

        return {
          _name,
          dataGuard: [1, 2],
          _createdUserId: null,
          _createdAt: 0,
          _updatedUserId: null,
          _updatedAt: 0,
          _status: 1,
        };
      });

      var result1 = await this.ratebaseMasterModel.insertMany(resultArray, {
        session: transactionSession,
      });

      const responseJSON = { message: 'success', data: { list: resultArray } };
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
  async tdsTcs(dto: TdsTcsMasterBulkDataDto,_userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      // var listStates = [{ Percentage: '1' }];

      const resultArray = dto.items.map((element) => {
        const { Percentage: _percentage } = element;

        return {
          _percentage,
          dataGuard: [1, 2],
          _createdUserId: null,
          _createdAt: 0,
          _updatedUserId: null,
          _updatedAt: 0,
          _status: 1,
        };
      });

      var result1 = await this.tdsModel.insertMany(resultArray, {
        session: transactionSession,
      });

      await this.tcsModel.insertMany(resultArray, {
        session: transactionSession,
      });

      const responseJSON = { message: 'success', data: { list: resultArray } };
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

  async rateCard(dto: RatecardBulkDataDto,_userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      

      // var listStates = [
      //   { Name: 'BASIC PRICE LIST', Percentage: '4' },
      //   { Name: 'BASIC PRICE LIST', Percentage: '4' },
      //   { Name: 'AKS', Percentage: '4' },
      //   { Name: 'BSC1', Percentage: '4' },
      //   { Name: 'BSC10', Percentage: '4' },
      //   { Name: 'BSC2', Percentage: '4' },
      //   { Name: 'BSC3', Percentage: '4' },
      //   { Name: 'BSC4', Percentage: '4' },
      //   { Name: 'BSC5', Percentage: '4' },
      //   { Name: 'BSC9', Percentage: '4' },
      //   { Name: 'CRP1', Percentage: '4' },
      //   { Name: 'CRP3', Percentage: '4' },
      //   { Name: 'CRP4', Percentage: '4' },
      //   { Name: 'CRP5', Percentage: '4' },
      //   { Name: 'SPL6', Percentage: '4' },
      //   { Name: 'JSC', Percentage: '4' },
      //   { Name: 'JWL', Percentage: '4' },
      //   { Name: 'MLB', Percentage: '4' },
      //   { Name: 'NRL1', Percentage: '4' },
      //   { Name: 'NRL10', Percentage: '4' },
      //   { Name: 'NRL11', Percentage: '4' },
      //   { Name: 'NRL12', Percentage: '4' },
      //   { Name: 'NRL2', Percentage: '4' },
      //   { Name: 'NRL3', Percentage: '4' },
      //   { Name: 'NRL4', Percentage: '4' },
      //   { Name: 'NRL5', Percentage: '4' },
      //   { Name: 'NRL6', Percentage: '4' },
      //   { Name: 'NRL7', Percentage: '4' },
      //   { Name: 'NRL8', Percentage: '4' },
      //   { Name: 'NRL9', Percentage: '4' },
      //   { Name: 'SPL1', Percentage: '4' },
      //   { Name: 'SPL10', Percentage: '4' },
      //   { Name: 'SPL11', Percentage: '4' },
      //   { Name: 'SPL12', Percentage: '4' },
      //   { Name: 'SPL3', Percentage: '4' },
      //   { Name: 'SPL4', Percentage: '4' },
      //   { Name: 'SPL7', Percentage: '4' },
      //   { Name: 'SPL8', Percentage: '4' },
      //   { Name: 'SPL9', Percentage: '4' },
      // ];
      var uniqueArray = [];
      var uniqueTypeArray = [];
      dto.items.filter((element) => {
        const isDuplicate = uniqueArray.includes(element.Name);

        if (!isDuplicate) {
          uniqueArray.push(element.Name);
          uniqueTypeArray.push(element.type);
          return true;
        }

        return false;
      });

      var rateCard = [];
      var rateCardPercentages = [];

      uniqueArray.map((element,index) => {
        var rateCardId = new mongoose.Types.ObjectId();
        rateCard.push({
          _id: rateCardId,
          _name: element,
          _type:uniqueTypeArray[index],
          _createdUserId: null,
          _createdAt: 0,
          _updatedUserId: null,
          _updatedAt: 0,
          _status: 1,
        });
        dto.items.forEach((elementChild) => {
          if (elementChild.Name == element) {
            rateCardPercentages.push({
              _rateCardId: rateCardId,
              _subCategoryId: dto.subCategoryId,
              _percentage: Number(elementChild.Percentage),
              _createdUserId: null,
              _createdAt: 0,
              _updatedUserId: null,
              _updatedAt: 0,
              _status: 1,
            });
          }
        });
      });

      var result1 = await this.ratecardModel.insertMany(rateCard, {
        session: transactionSession,
      });

      await this.ratecardPercentageModel.insertMany(rateCardPercentages, {
        session: transactionSession,
      });

      const responseJSON = {
        message: 'success',
        data: { uniqueList: uniqueArray },
      };
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

  async employee(dto: EmployeesBulkDataDto,_userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      // var listStates = [];

      // listStates = [
      //   {
      //     Name: 'MUHAMMED ALI',
      //     Gender: 'Male',
      //     Email: 'muhammedali@gmail.com',
      //     Mobile: '8156908916',
      //     Departments: 'SALES DIRECTOR',
      //     Prefix: '',
      //   },
      //   {
      //     Name: 'MAHESH KV',
      //     Gender: 'Male',
      //     Email: 'mahesh@gmail.com',
      //     Mobile: '1111111111',
      //     Departments: 'MARKETING DIRECTOR',
      //     Prefix: '',
      //   },
      //   {
      //     Name: 'SHARAFALI',
      //     Gender: 'Male',
      //     Email: 'sharafali@gmail.com',
      //     Mobile: '7591916002',
      //     Departments: 'DIRECTOR',
      //     Prefix: '',
      //   },
      //   {
      //     Name: 'ABDUL BASITH',
      //     Gender: 'Male',
      //     Email: 'abdulbasith@gmail.com',
      //     Mobile: '9605686054',
      //     Departments: 'DIRECTOR',
      //     Prefix: '',
      //   },
      //   {
      //     Name: 'NOUFAL M',
      //     Gender: 'Male',
      //     Email: 'noufal@gmail.com',
      //     Mobile: '9961916004',
      //     Departments: 'ORDER DIRECTOR',
      //     Prefix: 'IB',
      //   },
      //   {
      //     Name: 'PRIYA',
      //     Gender: 'Female',
      //     Email: 'priya@gmail.com',
      //     Mobile: '9072916003',
      //     Departments: 'ORDER CONTROLLER',
      //     Prefix: 'HN',
      //   },
      //   {
      //     Name: 'NASEEMA',
      //     Gender: 'Female',
      //     Email: 'naseema@gmail.com',
      //     Mobile: '9072916004',
      //     Departments: 'ORDER CONTROLLER',
      //     Prefix: 'YM',
      //   },
      //   {
      //     Name: 'FASIL RAZACK',
      //     Gender: 'Male',
      //     Email: 'fasilrazak@gmail.com',
      //     Mobile: '8156906916',
      //     Departments: 'SALES EXECUTIVE',
      //     Prefix: '',
      //   },
      //   {
      //     Name: 'ANAS',
      //     Gender: 'Male',
      //     Email: 'anas@gmail.com',
      //     Mobile: '9633305916',
      //     Departments: 'SALES EXECUTIVE',
      //     Prefix: '',
      //   },
      //   {
      //     Name: 'SHAJI',
      //     Gender: 'Male',
      //     Email: 'shaji@gmail.com',
      //     Mobile: '9947494916',
      //     Departments: 'SALES EXECUTIVE',
      //     Prefix: '',
      //   },
      //   {
      //     Name: 'FARSHAN',
      //     Gender: 'Male',
      //     Email: 'farshan@gmail.com',
      //     Mobile: '7591916008',
      //     Departments: 'ASSISTANT BRACH MANAGER',
      //     Prefix: '',
      //   },
      //   {
      //     Name: 'JUNAID',
      //     Gender: 'Male',
      //     Email: 'junaid@gmail.com',
      //     Mobile: '8592913678',
      //     Departments: 'SALES EXECUTIVE',
      //     Prefix: '',
      //   },
      //   {
      //     Name: 'MAHROOF',
      //     Gender: 'Male',
      //     Email: 'mahroof@gmail.com',
      //     Mobile: '7356428916',
      //     Departments: 'ASSISTANT BRACH MANAGER',
      //     Prefix: '',
      //   },
      //   {
      //     Name: 'ASHIQ P',
      //     Gender: 'Male',
      //     Email: 'ashiq@gmail.com',
      //     Mobile: '9544633624',
      //     Departments: 'ASSISTANT BRACH MANAGER',
      //     Prefix: '',
      //   },
      //   {
      //     Name: 'RAHUL',
      //     Gender: 'Male',
      //     Email: 'rahul@gmail.com',
      //     Mobile: '8086934921',
      //     Departments: 'SALES EXECUTIVE',
      //     Prefix: '',
      //   },
      //   {
      //     Name: 'ABID',
      //     Gender: 'Male',
      //     Email: 'abid@gmail.com',
      //     Mobile: '7034304428',
      //     Departments: 'SALES EXECUTIVE',
      //     Prefix: '',
      //   },
      //   {
      //     Name: 'JABBAR',
      //     Gender: 'Male',
      //     Email: 'jabbar@gmail.com',
      //     Mobile: '8138916133',
      //     Departments: 'ORDER CONTROLLER',
      //     Prefix: 'HD',
      //   },
      //   {
      //     Name: 'HAFIS',
      //     Gender: 'Male',
      //     Email: 'hafis@gmail.com',
      //     Mobile: '2222222222',
      //     Departments: 'ORDER CONTROLLER',
      //     Prefix: 'IBS',
      //   },
      //   {
      //     Name: 'SHAREEF',
      //     Gender: 'Male',
      //     Email: 'shareef@gmail.com',
      //     Mobile: '9567916222',
      //     Departments: 'ORDER CONTROLLER',
      //     Prefix: 'SH',
      //   },
      // ];
      var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
        { _tableName: ModelNames.EMPLOYEES },
        {
          $inc: {
            _count: dto.items.length,
          },
        },
        { new: true, session: transactionSession },
      );
      var resultDepartment = await this.departmentModel.find({ _status: 1 });
      var arrayUsers = [];
      var arrayEmployees = [];
      var encryptedPassword = await crypto
        .pbkdf2Sync(
          '123456',
          process.env.CRYPTO_ENCRYPTION_SALT,
          1000,
          64,
          `sha512`,
        )
        .toString(`hex`);
        dto.items.forEach((element, index) => {
        var employeeId = new mongoose.Types.ObjectId();

        var userId = new mongoose.Types.ObjectId();

        var gender = 0;
        if (element.Gender == 'Female') {
          gender = 1;
        }

        arrayUsers.push({
          _id: userId,
          _name: element.Name,
          _gender: gender,
          _email: element.Email,
          _password: encryptedPassword,
          _mobile: element.Mobile,
          _globalGalleryId: null,
          _customType: [0],
          _employeeId: employeeId,
          _agentId: null,
          _supplierId: null,
          _testCenterId: null,
          _shopId: null,
          _halmarkId: null,
          _customerId: null,
          _fcmId: '',
          _isNotificationEnable:1,
          _deliveryHubId: null,
          _logisticPartnerId: null,
          _deviceUniqueId: '',
          _permissions: [],
          _userType: 3,
          _createdUserId: null,
          _createdAt: 0,
          _updatedUserId: null,
          _updatedAt: 0,
          _status: 1,
        });

        var countIndexDep = resultDepartment.findIndex(
          (indexItem) => indexItem._name == element.Departments,
        );

        arrayEmployees.push({
          _id:employeeId,
          _userId: userId,
          _uid: resultCounterPurchase._count - dto.items.length + index + 1,
          _departmentId: resultDepartment[countIndexDep]._id,
          _prefix: element.Prefix,
          _processMasterId: null,
          _lastLogin: 0,
          _dataGuard: [],
          _createdUserId: null,
          _createdAt: 0,
          _updatedUserId: null,
          _updatedAt: 0,
          _status: 1,
        });
      });

      var result1 = await this.employeeModel.insertMany(arrayEmployees, {
        session: transactionSession,
      });
      await this.userModel.insertMany(arrayUsers, {
        session: transactionSession,
      });

      const responseJSON = { message: 'success', data: {} };
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

  async shop(dto: ShopBulkDataDto, _userId_: string) {
    var dateTime = new Date().getTime();
    const transactionSession = await this.connection.startSession();
    transactionSession.startTransaction();
    try {
      // var listStates = [
      //   {
      //     LEGAL_NAME: 'AADHAR GOLD CHEMMAD LLP',
      //     DISPLAY_NAME: 'AADHAR CHEMMAD',
      //     Email: 'aadhargold@gmail.com',
      //     Mobile: '98950059160',
      //     Address:
      //       'TPV/157, E,F,G, NEW-V/1318 A,B,C, GROUND FLOOR, KHALEEJ MALL, CHEMMAD, TIRURANGADI, MALAPPURAM, KERALA, 676303',
      //     Shop_Type: 'B2B',
      //     City: 'CHEMMAD',
      //     Branch: 'INKEL',
      //     Is_Supplier: 'No',
      //     Agent: 'NA',
      //     Order_head: 'NASEEMA',
      //     Relationship_manager: 'MAHESH KV',
      //     RateCard: 'NRL8',
      //     Rate_Base: '99.5',
      //     TDS_TCS: 'TCS',
      //     TDS_TCS_Value: '1',
      //     Commision_Type: 'Percentage',
      //     Commision_Value: '0',
      //     PanCard_Number: 'ABFFA6865M',
      //     GST_Number: '32ABFFA6865M1Z4',
      //     Credit_Amount: '0',
      //     Credit_Days: '0',
      //     Stone_Pricing: '0',
      //     OrderSale_Rate: 'Fix',
      //     Stoc_Sale_Rate: 'Fix',
      //     Billing_Model_Sales: 'Pure weight',
      //     Billing_Mode_Purchase: 'Pure weight',
      //     Hallmarking_Mandatory_Status: 'No',
      //     Chat_Permission: 'Allow Document Uploading',
      //     User_Name: 'AADHAR CHEMMAD',
      //     User_Email: 'aadhargold1@gmail.com',
      //     User_mobile: '9895005916',
      //     User_Gender: 'Male',
      //   },
      //   {
      //     LEGAL_NAME: 'MASS GOLD LLP-AADHAR KONDOTTY',
      //     DISPLAY_NAME: 'AADHAR KONDOTTY',
      //     Email: 'aadharkty@gmail.com',
      //     Mobile: '95263300040',
      //     Address:
      //       '18/1018D, SECOND FLOOR, NADHA COMPLEX, ZC NORTH ROAD, CHALAPPURAM, KOZHIKODE, 673002',
      //     Shop_Type: 'B2B',
      //     City: 'KONDOTTY',
      //     Branch: 'INKEL',
      //     Is_Supplier: 'No',
      //     Agent: 'NA',
      //     Order_head: 'NASEEMA',
      //     Relationship_manager: 'MUHAMMED ALI',
      //     RateCard: 'SPL8',
      //     Rate_Base: '99.5',
      //     TDS_TCS: 'TCS',
      //     TDS_TCS_Value: '1',
      //     Commision_Type: 'Percentage',
      //     Commision_Value: '0',
      //     PanCard_Number: 'AAYFM3197J',
      //     GST_Number: '32AAYFM3197J1ZM',
      //     Credit_Amount: '0',
      //     Credit_Days: '0',
      //     Stone_Pricing: '0',
      //     OrderSale_Rate: 'Un fix',
      //     Stoc_Sale_Rate: 'Un Fix',
      //     Billing_Model_Sales: 'Pure weight',
      //     Billing_Mode_Purchase: 'Pure weight',
      //     Hallmarking_Mandatory_Status: 'No',
      //     Chat_Permission: 'Allow Document Uploading',
      //     User_Name: 'aadharkty',
      //     User_Email: 'aadharkty1@gmail.com',
      //     User_mobile: '9526330004',
      //     User_Gender: 'Male',
      //   },
      // ];

      var resultCompany=await this.companyModel.aggregate([{$match:{_status:1}},
      
        {
          $lookup: {
            from: ModelNames.CITIES,
            let: { cityId: '$_cityId' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$cityId'] },
                },
              },

              {
                $lookup: {
                  from: ModelNames.DISTRICTS,
                  let: { districtId: '$_districtsId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$districtId'] },
                      },
                    },

                    {
                      $lookup: {
                        from: ModelNames.STATES,
                        let: { stateId: '$_statesId' },
                        pipeline: [
                          {
                            $match: {
                              $expr: { $eq: ['$_id', '$$stateId'] },
                            },
                          },
                        ],
                        as: 'stateDetails',
                      },
                    },
                    {
                      $unwind: {
                        path: '$stateDetails',
                        preserveNullAndEmptyArrays: true,
                      },
                    },

                  ],
                  as: 'districtDetails',
                },
              },
              {
                $unwind: {
                  path: '$districtDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },



            ],
            as: 'cityDetails',
          },
        },
        {
          $unwind: {
            path: '$cityDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
      
      ]);
      var resultBranch = await this.branchModel.find({ _status: 1 });
      var resultRateCard = await this.ratecardModel.find({ _status: 1 });
      var resultCity = await this.cityModel.aggregate([{$match:{_status:1}},
      
      
        {
          $lookup: {
            from: ModelNames.DISTRICTS,
            let: { districtId: '$_districtsId' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$districtId'] },
                },
              },

              {
                $lookup: {
                  from: ModelNames.STATES,
                  let: { stateId: '$_statesId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$_id', '$$stateId'] },
                      },
                    },
                  ],
                  as: 'stateDetails',
                },
              },
              {
                $unwind: {
                  path: '$stateDetails',
                  preserveNullAndEmptyArrays: true,
                },
              },

            ],
            as: 'districtDetails',
          },
        },
        {
          $unwind: {
            path: '$districtDetails',
            preserveNullAndEmptyArrays: true,
          },
        },

      
      ]);
      var resultRateBase = await this.ratebaseMasterModel.find({ _status: 1 });
      var resultUsers = await this.userModel.find({ _status: 1 });

      var encryptedPasswordDefault = await crypto
        .pbkdf2Sync(
          '123456',
          process.env.CRYPTO_ENCRYPTION_SALT,
          1000,
          64,
          `sha512`,
        )
        .toString(`hex`);




        var tradeReceivable = await this.accountSubGroupModel.find({
          _code: '102003',
        });
        if (tradeReceivable.length == 0) {
          throw new HttpException(
            'Trade receivable not found in acount sub group',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        


      var resultCounterPurchase = await this.counterModel.findOneAndUpdate(
        { _tableName: ModelNames.SHOPS },
        {
          $inc: {
            _count: dto.items.length,
          },
        },
        { new: true, session: transactionSession },
      );

      var arrayUsers = [];
      var arrayshops = [];
      var arrayAccountLedger = [];

      dto.items.forEach((element, index) => {
        var shopId = new mongoose.Types.ObjectId();










        var orderSaleRate = 0;
        if (element.OrderSale_Rate == 'Un fix') {
          orderSaleRate = 1;
        }
        var stockSaleRate = 0;
        if (element.Stoc_Sale_Rate == 'Un fix') {
          stockSaleRate = 1;
        }
        var shopType = 0;
        if (element.Shop_Type == 'B2C') {
          shopType = 1;
        }
        var commisionType = 0;
        if (element.Commision_Type == 'Percentage') {
          commisionType = 1;
        }
        var isSupplier = 1;
        if (element.Is_Supplier == 'No') {
          isSupplier = 0;
        }
        var isHalmarkingMandatoryStatus = 1; //Yes,No
        if (element.Hallmarking_Mandatory_Status == 'No') {
          isHalmarkingMandatoryStatus = 0;
        }

        var tdsTcsStatus = 0;
        if (element.TDS_TCS == 'TCS') {
          tdsTcsStatus = 1;
        }
        var billmodeSale = -1; //Pure weight,Net weight,Job work
        if (element.Billing_Model_Sales == 'Pure weight') {
          billmodeSale = 0;
        } else if (element.Billing_Model_Sales == 'Net weight') {
          billmodeSale = 1;
        } else if (element.Billing_Model_Sales == 'Job work') {
          billmodeSale = 2;
        }

        var billmodePurchase = -1; //Pure weight,Net weight,Job work
        if (element.Billing_Mode_Purchase == 'Pure weight') {
          billmodePurchase = 0;
        } else if (element.Billing_Mode_Purchase == 'Net weight') {
          billmodePurchase = 1;
        } else if (element.Billing_Mode_Purchase == 'Job work') {
          billmodePurchase = 2;
        }

        var countIndexBranch = resultBranch.findIndex(
          (it) => it._name == element.Branch,
        );

        var countIndexRatecard = resultRateCard.findIndex(
          (it) => it._name == element.RateCard,
        );
        var countIndexCity = resultCity.findIndex(
          (it) => it._name == element.City,
        );
        var countIndexRatebase = resultRateBase.findIndex(
          (it) => it._name == element.Rate_Base,
        );
        var countIndexUserOH = resultUsers.findIndex(
          (it) => it._name == element.Order_head,
        );
        var countIndexUserRM = resultUsers.findIndex(
          (it) => it._name == element.Relationship_manager,
        );


        var isIgstTaxEnabled=0;
if(resultCompany[0].cityDetails.districtDetails.stateDetails._name!=resultCity[countIndexCity].districtDetails.stateDetails._name){
  isIgstTaxEnabled=1;
}
        
        // countIndexCity










var shopUid=resultCounterPurchase._count - dto.items.length + index + 1;


var shopAccountId = new mongoose.Types.ObjectId();
arrayAccountLedger.push({
_id:shopAccountId,
  _code: tradeReceivable[0]._code + '000' + shopUid,
  _name: element.LEGAL_NAME,
  _underId: tradeReceivable[0]._id,
  _address: element.Address,
  _phone: element.Mobile,
  _email: element.Email,
  _city: '',
  _state: '',
  _country: '',
  _pin: '',
  _remarks: '',
  _createdUserId: _userId_,
  _createdAt: dateTime,
  _updatedUserId: null,
  _updatedAt: -1,
  _status: 1,
});


        arrayshops.push({
          _id: shopId,
          _name: element.LEGAL_NAME,

          _displayName: element.DISPLAY_NAME,
          _uid: shopUid,
          _globalGalleryId: null,
          _orderSaleRate: orderSaleRate,
          _stockSaleRate: stockSaleRate,
          _address: element.Address,
          _shopType: shopType,
          _freezedUserId:null,
          _isTaxIgstEnabled: isIgstTaxEnabled,
          _accountId: shopAccountId,
          _commisionType: commisionType,
          _branchId: resultBranch[countIndexBranch]._id,
          _orderHeadId: resultUsers[countIndexUserOH]._id,
          _relationshipManagerId: resultUsers[countIndexUserRM]._id,
          _isSupplier: isSupplier,
          _panCardNumber: element.PanCard_Number,
          _billingModeSale: billmodeSale,
          _billingModePurchase: billmodePurchase,
          _hallmarkingMandatoryStatus: isHalmarkingMandatoryStatus,
          _rateCardId: resultRateCard[countIndexRatecard]._id,
          _gstNumber: element.GST_Number,
          _tdsTcsStatus: dto.tdsTcsValue,
          _cityId: resultCity[countIndexCity]._id,
          _tdsId: null,
          _tcsId: dto.tcsIdAlways,
          _creditAmount: Number(element.Credit_Amount),
          _creditDays: Number(element.Credit_Days),
          _rateBaseMasterId: resultRateBase[countIndexRatebase]._id, //countIndexRatebase
          _stonePricing: Number(element.Stone_Pricing),
          _chatPermissions: [0, 1],
          _agentId: null,
          _agentCommision: 0,
          _location: { type: 'Point', coordinates: [0, 0] },
          _isFreezed:0,
          _freezedDescription:"",
          _freezedRootCause:null,
          _dataGuard: [],
          _createdUserId: _userId_,
          _createdAt: dateTime,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });

        //shop User
        arrayUsers.push({
          _email: element.Email,
          _name: element.DISPLAY_NAME,
          _gender: 2,
          _password: encryptedPasswordDefault,
          _mobile: element.Mobile,
          _globalGalleryId: null,
          _employeeId: null,
          _agentId: null,
          _supplierId: null,
          _shopId: shopId,
          _logisticPartnerId: null,
          _testCenterId: null,
          _customType: [5],
          _deliveryHubId: null,
          _halmarkId: null,
          _customerId: null,
          _fcmId: '',
          _isNotificationEnable:1,
          _deviceUniqueId: '',
          _permissions: [],
          _userType: 0,
          _createdUserId: null,
          _createdAt: -1,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });

        var userGender = 0;
        if (element.User_Gender == 'Female') {
          userGender = 1;
        }

        arrayUsers.push({
          _email: element.User_Email,
          _name: element.User_Name,
          _gender: userGender,
          _password: encryptedPasswordDefault,
          _mobile: element.User_mobile,
          _globalGalleryId: null,
          _employeeId: null,
          _agentId: null,
          _supplierId: null,
          _shopId: shopId,
          _logisticPartnerId: null,
          _testCenterId: null,
          _customType: [1],
          _deliveryHubId: null,
          _halmarkId: null,
          _customerId: null,
          _fcmId: '',
          _isNotificationEnable:1,
          _deviceUniqueId: '',
          _permissions: [],
          _userType: 0,
          _createdUserId: null,
          _createdAt: -1,
          _updatedUserId: null,
          _updatedAt: -1,
          _status: 1,
        });
      });

      var result1 = await this.shopModel.insertMany(arrayshops, {
        session: transactionSession,
      });


      await this.accountLedgerModel.insertMany(arrayAccountLedger, {
        session: transactionSession,
      });

      await this.userModel.insertMany(arrayUsers, {
        session: transactionSession,
      });

      const responseJSON = { message: 'success', data: {} };
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
