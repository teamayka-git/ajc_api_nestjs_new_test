import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common'
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const ssl = process.env.SSL === 'true' ? true : false;
  let httpsOptions = null;
  if (ssl) {
    const keyPath = process.env.SSL_KEY_PATH || '';
    const certPath = process.env.SSL_CERT_PATH || '';
    httpsOptions = {
      key: fs.readFileSync(path.join(__dirname, keyPath)),
      cert: fs.readFileSync(path.join(__dirname, certPath)),
    };
  }

  const app = await NestFactory.create(AppModule,{ httpsOptions });
  app.use(cookieParser());//jwt read from cookie
  app.enableCors({
    origin: "*"
    , credentials: true//jwt response store in cookie
  });


  app.setGlobalPrefix(process.env.GLOBAL_PREFIX_FOR_API);
  console.log("satarted----------------");
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
     whitelist: true, // if in body unwanted items then no need to throw bad request
    forbidNonWhitelisted: true
  }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Swagger API Documentation")
    .setDescription("here explaining common structure of API,[priority->It will be integer. it will sort that items, searchingText->It is string for search key, skip->This is pagination offset, limit->This is for pagination Limit, screenType->it's for optional datas]")
    .setVersion("1.0")
    .build();
  const doc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(process.env.SWAGGER_DOC_URL, app, doc, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha'
    }
  });



  await app.listen(process.env.PORT);
  console.log("satarted----------------_");
}
bootstrap();
