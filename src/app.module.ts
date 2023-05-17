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
import { TestCenterMastersModule } from './modules/test-center-masters/test-center-masters.module';
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
import { FactoryCalculationTypeMasterModule } from './modules/factory-calculation-type-master/factory-calculation-type-master.module';
import { GoldTestingRequestModule } from './modules/gold-testing-request/gold-testing-request.module';
import { StatesSchema } from './tableModels/states.model';
import { DistrictsSchema } from './tableModels/districts.model';
import { CitiesSchema } from './tableModels/cities.model';
import { DeliveryTempModule } from './modules/delivery-temp/delivery-temp.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { ResponseFormatModule } from './modules/response-format/response-format.module';
import { GoldRateTimelinesSchema } from './tableModels/gold_rate_timelines.model';
import { LogisticsPartnersModule } from './modules/logistics-partners/logistics-partners.module';
import { TestChargeModule } from './modules/test-charge/test-charge.module';
import { DeliveryRejectedPendingModule } from './modules/delivery-rejected-pending/delivery-rejected-pending.module';
import { DeliveryReturnModule } from './modules/delivery-return/delivery-return.module';
import { OtpModule } from './modules/otp/otp.module';
import { BulkApiTempModule } from './modules/bulk-api-temp/bulk-api-temp.module';
import { GroupMastersSchema } from './tableModels/groupMasters.model';
import { CategoriesSchema } from './tableModels/categories.model';
import { SubCategoriesSchema } from './tableModels/sub_categories.model';
import { RootCausesSchema } from './tableModels/rootCause.model';
import { UserAttendanceSchema } from './tableModels/user_attendances.model';
import { DeliveryCounterModule } from './modules/delivery-counter/delivery-counter.module';
import { DeliveryCounterBundleModule } from './modules/delivery-counter-bundle/delivery-counter-bundle.module';
import { TagMastersModule } from './modules/tag-masters/tag-masters.module';
import { DeliveryCounterUserLinkingsSchema } from './tableModels/delivery_counter_user_linkings.model';
import { OrderSalesMainSchema } from './tableModels/order_sales_main.model';
import { OrderSaleSetProcessesSchema } from './tableModels/order_sale_set_processes.model';
import { StorePromotionsModule } from './modules/store-promotions/store-promotions.module';
import { PurchaseBookingModule } from './modules/purchase-booking/purchase-booking.module';
import { PurchaseOrderModule } from './modules/purchase-order/purchase-order.module';
import { FactoryStockTransferModule } from './modules/factory-stock-transfer/factory-stock-transfer.module';
import { EmployeeStockHandsModule } from './modules/employee-stock-hands/employee-stock-hands.module';
import { PurchaseModule } from './modules/purchase/purchase.module';
import { OrderSaleChangeRequestModule } from './modules/order-sale-change-request/order-sale-change-request.module';
import { ProductTempModule } from './modules/product-temp/product-temp.module';
import { OrderSaleHistoriesSchema } from './tableModels/order_sale_histories.model';
import { InvoicesSchema } from './tableModels/invoices.model';
import { DeliverySchema } from './tableModels/delivery.model';
import { AccountHeadModule } from './modules/account-head/account-head.module';
import { AccountGroupModule } from './modules/account-group/account-group.module';
import { AccountSubgroupModule } from './modules/account-subgroup/account-subgroup.module';
import { AccountLedgerModule } from './modules/account-ledger/account-ledger.module';
import { AccountJournalModule } from './modules/account-journal/account-journal.module';
import { AccountBranchModule } from './modules/account-branch/account-branch.module';
import { AccountCurrencyModule } from './modules/account-currency/account-currency.module';
import { HalmarkRequestModule } from './modules/halmark-request/halmark-request.module';
import { UsersModule } from './modules/users/users.module';
import { UserNotificationsSchema } from './tableModels/user_notifications.model';
import { CronJobSchedulerModule } from './modules/cron-job-scheduler/cron-job-scheduler.module';
import { ProductsSchema } from './tableModels/products.model';
import { AccountPostInvoiceModule } from './modules/account-post-invoice/account-post-invoice.module';


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
      
      { name: ModelNames.ROOT_CAUSES, schema: RootCausesSchema },
      { name: ModelNames.ORDER_SALES_MAIN, schema: OrderSalesMainSchema },
      { name: ModelNames.ORDER_SALE_SET_PROCESSES, schema: OrderSaleSetProcessesSchema },
      { name: ModelNames.USER, schema: UserSchema },
      { name: ModelNames.EMPLOYEES, schema: EmployeeSchema },
      { name: ModelNames.COUNTERS, schema: CountersSchema },
      { name: ModelNames.COMPANIES, schema: CompanySchema },
      { name: ModelNames.GENERALS, schema: GeneralsSchema },
      { name: ModelNames.STATES, schema:StatesSchema },
      { name: ModelNames.DISTRICTS, schema:DistrictsSchema },
      { name: ModelNames.GROUP_MASTERS, schema:GroupMastersSchema },
      { name: ModelNames.CATEGORIES, schema:CategoriesSchema },
      { name: ModelNames.SUB_CATEGORIES, schema:SubCategoriesSchema },
      { name: ModelNames.CITIES, schema:CitiesSchema },
      { name: ModelNames.DEPARTMENT, schema: DepartmentsSchema },
      { name: ModelNames.PURITY, schema: PuritySchema },
      { name: ModelNames.PROCESS_MASTER, schema: ProcessMasterSchema },
      { name: ModelNames.DELIVERY, schema: DeliverySchema },
      
      { name: ModelNames.PRODUCTS, schema: ProductsSchema },
      { name: ModelNames.USER_NOTIFICATIONS, schema: UserNotificationsSchema },
      { name: ModelNames.INVOICES, schema: InvoicesSchema },
      {
        name: ModelNames.GLOBAL_GALLERY_CATEGORIES,
        schema: GlobalGalleryCategoriesSchema,
      },
      {
        name: ModelNames.ORDER_SALE_HISTORIES,
        schema: OrderSaleHistoriesSchema,
      },
      { name: ModelNames.DELIVERY_COUNTER_USER_LINKINGS, schema: DeliveryCounterUserLinkingsSchema },
      {
        name: ModelNames.CHAT_PENDING_MESSAGES,
        schema: ChatPendingMessagesSchema,
      },
      { name: ModelNames.CHAT_PERSONAL_CHATS, schema: ChatPersonalChatsSchema },
      { name: ModelNames.GOLD_RATE_TIMELINES, schema: GoldRateTimelinesSchema },
      {
        name: ModelNames.CHAT_PERSONAL_CHAT_MESSAGES,
        schema: ChatPersonalChatMessagesSchema,
      },
      { name: ModelNames.COLOUR_MASTERS, schema: ColoursSchema },
      { name: ModelNames.USER_ATTENDANCES, schema: UserAttendanceSchema },
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
    TestCenterMastersModule,
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
    FactoryCalculationTypeMasterModule,
    GoldTestingRequestModule,
    DeliveryTempModule,
    DeliveryModule,
    ResponseFormatModule,
    LogisticsPartnersModule,
    TestChargeModule,
    DeliveryRejectedPendingModule,
    DeliveryReturnModule,
    OtpModule,
    BulkApiTempModule,
    DeliveryCounterModule,
    DeliveryCounterBundleModule,
    TagMastersModule,
    StorePromotionsModule,
    PurchaseBookingModule,
    PurchaseOrderModule,
    FactoryStockTransferModule,
    EmployeeStockHandsModule,
    PurchaseModule,
    OrderSaleChangeRequestModule,
    ProductTempModule,
    AccountHeadModule,
    AccountGroupModule,
    AccountSubgroupModule,
    AccountLedgerModule,
    AccountJournalModule,
    AccountBranchModule,
    AccountCurrencyModule,
    AccountPostInvoiceModule,
    HalmarkRequestModule,
    UsersModule,
    CronJobSchedulerModule,

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
        process.env.GLOBAL_PREFIX_FOR_API + '/employees/(.*)',
        process.env.GLOBAL_PREFIX_FOR_API + '/shops/login',
        process.env.GLOBAL_PREFIX_FOR_API + '/branch',
        process.env.GLOBAL_PREFIX_FOR_API + '/generals/list',
        process.env.GLOBAL_PREFIX_FOR_API + '/otp/createOtp',
        process.env.GLOBAL_PREFIX_FOR_API + '/changeUserPassword',
      )
      .forRoutes('*');
  }
}
