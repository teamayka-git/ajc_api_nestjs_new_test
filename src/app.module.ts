import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpErrorFilter } from './shared/http-error.filter';
import { LoggingInterceptor } from './shared/logging.interceptor';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalConfig } from './config/global_config';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static/dist/serve-static.module';
import { join } from 'path';
import { ModelNames } from './common/model_names';
import { UserSchema } from './tableModels/user.model';
import { EmployeeSchema } from './tableModels/employee.model';
import { CountersSchema } from './tableModels/counters.model';
import { EmployeesModule } from './modules/employees/employees.module';
import { BranchModule } from './modules/branch/branch.module';
import { StatesModule } from './modules/states/states.module';
import { DistrictsModule } from './modules/districts/districts.module';
import { CitiesModule } from './modules/cities/cities.module';
import { GeneralsModule } from './modules/generals/generals.module';
import { GeneralsSchema } from './tableModels/generals.model';
import { GoldRateTimelinesModule } from './modules/gold-rate-timelines/gold-rate-timelines.module';
import { DeliveryHubsModule } from './modules/delivery-hubs/delivery-hubs.module';
import { GroupMastersModule } from './modules/group-masters/group-masters.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { SubCategoriesModule } from './modules/sub-categories/sub-categories.module';
import { StoneModule } from './modules/stone/stone.module';
import { PurityModule } from './modules/purity/purity.module';
import { PuritySchema } from './tableModels/purity.model';
import { DepartmentsModule } from './modules/departments/departments.module';
import { DepartmentsSchema } from './tableModels/departments.model';
import { ProcessMasterModule } from './modules/process-master/process-master.module';
import { UnitMastersModule } from './modules/unit-masters/unit-masters.module';
import { TdsMastersModule } from './modules/tds-masters/tds-masters.module';
import { TcsMastersModule } from './modules/tcs-masters/tcs-masters.module';
import { TransportMastersModule } from './modules/transport-masters/transport-masters.module';
import { TestCenterMastersModule } from './modules/test-center-masters/test-center-masters.module';
import { TestChargeMastersModule } from './modules/test-charge-masters/test-charge-masters.module';
import { FactoriesModule } from './modules/factories/factories.module';
import { AgentModule } from './modules/agent/agent.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { CompanySchema } from './tableModels/companies.model';
import { CompanyModule } from './modules/company/company.module';
import { GlobalGalleryCategoryModule } from './modules/global-gallery-category/global-gallery-category.module';
import { BanksModule } from './modules/banks/banks.module';
import { GlobalGalleryModule } from './modules/global-gallery/global-gallery.module';
import { ProcessMasterSchema } from './tableModels/processMaster.model';
import { GlobalGalleryCategoriesSchema } from './tableModels/globalGallerycategories.model';
import { ChatGateway } from './socket/chat.gateway';
import { ChatPendingMessagesSchema } from './tableModels/chatPendingMessager.model';
import { ChatPersonalChatsSchema } from './tableModels/chatPersonalChats.model';
import { ChatPersonalChatMessagesSchema } from './tableModels/chatPersonalChatMessages.model';
import { RateCardModule } from './modules/rate-card/rate-card.module';
import { RateBaseMastersModule } from './modules/rate-base-masters/rate-base-masters.module';
import { OrderSalesModule } from './modules/order-sales/order-sales.module';
import { OrderSaleSetProcessModule } from './modules/order-sale-set-process/order-sale-set-process.module';
import { ProductsModule } from './modules/products/products.module';
import { ColourMastersModule } from './modules/colour-masters/colour-masters.module';
import { ColoursSchema } from './tableModels/colourMasters.model';
import { UserAttendanceModule } from './modules/user-attendance/user-attendance.module';
import { HalmarkCentersModule } from './modules/halmark-centers/halmark-centers.module';
import { RootCausesModule } from './modules/root-causes/root-causes.module';
import { ShopsModule } from './modules/shops/shops.module';
import { DeliveryProviderModule } from './modules/delivery-provider/delivery-provider.module';
import { PhotographyRequestModule } from './modules/photography-request/photography-request.module';
import { DeliveryChellanModule } from './modules/delivery-chellan/delivery-chellan.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { HalmarkingRequestsModule } from './modules/halmarking-requests/halmarking-requests.module';
import { FactoryCalculationTypeMasterModule } from './modules/factory-calculation-type-master/factory-calculation-type-master.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    JwtModule.register({
      secret: GlobalConfig().JWT_SECRET_KEY,
      signOptions: {},
    }), //jwt implement
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.DB_GULL_URL),
    MongooseModule.forFeature([
      { name: ModelNames.USER, schema: UserSchema },
      { name: ModelNames.EMPLOYEES, schema: EmployeeSchema },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
      { name: ModelNames.COMPANIES, schema: CompanySchema },
      { name: ModelNames.GENERALS, schema: GeneralsSchema },
      { name: ModelNames.DEPARTMENT, schema: DepartmentsSchema },
      { name: ModelNames.PURITY, schema: PuritySchema },
      { name: ModelNames.PROCESS_MASTER, schema: ProcessMasterSchema },
      {
        name: ModelNames.GLOBAL_GALLERY_CATEGORIES,
        schema: GlobalGalleryCategoriesSchema,
      },

      {
        name: ModelNames.CHAT_PENDING_MESSAGES,
        schema: ChatPendingMessagesSchema,
      },
      { name: ModelNames.CHAT_PERSONAL_CHATS, schema: ChatPersonalChatsSchema },
      {
        name: ModelNames.CHAT_PERSONAL_CHAT_MESSAGES,
        schema: ChatPersonalChatMessagesSchema,
      },
      { name: ModelNames.COLOUR_MASTERS, schema: ColoursSchema },
    ]),
    EmployeesModule,
    BranchModule,
    StatesModule,
    DistrictsModule,
    CitiesModule,
    GeneralsModule,
    GoldRateTimelinesModule,
    DeliveryHubsModule,
    GroupMastersModule,
    CategoriesModule,
    SubCategoriesModule,
    StoneModule,
    PurityModule,
    DepartmentsModule,
    ProcessMasterModule,
    UnitMastersModule,
    TdsMastersModule,
    TcsMastersModule,
    TransportMastersModule,
    TestCenterMastersModule,
    TestChargeMastersModule,
    FactoriesModule,
    AgentModule,
    SupplierModule,
    RootCausesModule,
    CompanyModule,
    GlobalGalleryCategoryModule,
    BanksModule,
    GlobalGalleryModule,
    RateCardModule,
    RateBaseMastersModule,
    ShopsModule,
    OrderSalesModule,
    OrderSaleSetProcessModule,
    ProductsModule,
    ColourMastersModule,
    UserAttendanceModule,
    HalmarkCentersModule,
    DeliveryProviderModule,
    PhotographyRequestModule,
    DeliveryChellanModule,
    InvoicesModule,
    HalmarkingRequestsModule,
    FactoryCalculationTypeMasterModule,

    // SalesReturnRequestStatusesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpErrorFilter,
    },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    ChatGateway,
  ],
})
export class AppModule {
  //for middleware
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude(
        process.env.GLOBAL_PREFIX_FOR_API + '/project_init',
        // process.env.GLOBAL_PREFIX_FOR_API + '/(.*)',
        // process.env.GLOBAL_PREFIX_FOR_API + '/store_front/(.*)',
        process.env.GLOBAL_PREFIX_FOR_API + '/employees/login',
        process.env.GLOBAL_PREFIX_FOR_API + '/shops/login',
      )
      .forRoutes('*');
  }
}
