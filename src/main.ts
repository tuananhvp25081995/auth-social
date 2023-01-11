import {
  ClassSerializerInterceptor,
  Logger,
  RequestMethod,
  ValidationPipe,
  HttpStatus,
  UnprocessableEntityException,
  VersioningType
} from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import {
  ExpressAdapter,
  NestExpressApplication
} from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { SharedModule } from "./core/shared";
import compression from "compression";
import { middleware as expressCtx } from "express-ctx";
import morgan from "morgan";
import { BadRequestExceptionFilter } from "./core/filters";
import {
  TimeoutInterceptor,
  TransformResponseInterceptor
} from "./core/interceptors";
import { ApiConfigService } from "./core/shared/services";
import { setupSwagger } from "./setup-swagger";

async function bootstrap() {
  const logger = new Logger("Main");
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter()
  );
  const configService = app.select(SharedModule).get(ApiConfigService);

  app.enable("trust proxy");

  app.enableCors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (!configService.domainWhitelist.includes(origin)) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";

        return callback(new Error(msg), false);
      }

      return callback(null, true);
    },
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
    credentials: true
  });

  app.setGlobalPrefix("api", {
    exclude: [{ path: "health", method: RequestMethod.GET }]
  });
  app.use(compression());
  app.use(morgan("combined"));
  app.enableVersioning({
    defaultVersion: "1",
    type: VersioningType.URI
  });

  const reflector = app.get(Reflector);

  app.useLogger(logger);

  // -----------Global filter-------------
  app.useGlobalFilters(new BadRequestExceptionFilter(reflector));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
  app.useGlobalInterceptors(new TransformResponseInterceptor());
  app.useGlobalInterceptors(new TimeoutInterceptor());

  // -------------------------------------------

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transform: true,
      skipMissingProperties: false,
      exceptionFactory: (errors) => new UnprocessableEntityException(errors)
    })
  );

  // -----------Setup Swagger-------------
  if (configService.documentationEnabled) {
    setupSwagger(app);
  }

  app.use(expressCtx);

  const port = configService.appConfig.port;

  await app.listen(port);

  logger.log(`Server running on ${await app.getUrl()}`);
}
bootstrap();
