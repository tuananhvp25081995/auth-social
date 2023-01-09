import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import RedisStore from 'connect-redis';
import session from 'express-session';
import { join, resolve } from 'path';
import { createClient } from 'redis';
import { DatabaseModule } from 'src/core/lib/database';
import { v4 as uuidV4 } from 'uuid';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SocketStateModule } from './app/adapters';
import {
  AuthModule,
  UserModule,
  HealthCheckerModule,
} from './app/modules';
import { AllExceptionFilter } from './core/filters';
import { LoggerModule, RedisModule } from './core/lib';
import { SharedModule } from './core/shared';
import { ApiConfigService } from './core/shared/services';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot(
      (() => {
        const publicDir = resolve('./upload/');
        const servePath = '/files';

        return {
          rootPath: publicDir,
          serveRoot: servePath,
          exclude: ['/api*'],
          index: false,
        };
      })(),
    ),
    ScheduleModule.forRoot(),
    DatabaseModule,
    SharedModule,
    LoggerModule,
    RedisModule,
    AuthModule,
    UserModule,
    HealthCheckerModule,
    SocketStateModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  constructor(private configService: ApiConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    const client = createClient({
      url: this.configService.redisConfig.url,
    });

    const RedisStoreSession = RedisStore(session);

    consumer
      .apply(
        session({
          store: new RedisStoreSession({
            client,
            logErrors: true,
          }) as any,
          genid: () => uuidV4(),
          saveUninitialized: true,
          secret: this.configService.authConfig.sessionSecret,
          resave: false,
          cookie: {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            secure: this.configService.nodeEnv !== 'development',
            sameSite: this.configService.nodeEnv !== 'development' ? 'none' : false,
          },
        }),
      )
      .forRoutes('*');
  }
}
