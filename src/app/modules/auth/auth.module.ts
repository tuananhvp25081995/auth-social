import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { RedisModule } from "src/core/lib";
import { DatabaseModule } from "src/core/lib/database";
import { MailModule } from "src/core/lib/mail";
import { OtpModule, OtpService } from "src/core/lib/otp";
import { ApiConfigService } from "src/core/shared/services";

import { UserModule } from "../user";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy, FacebookStrategy, GoogleStrategy } from "./strategies";
import { SocialController } from "./controllers";
import { SocialService } from "./services";

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ApiConfigService) => ({
        secret: configService.authConfig.jwtSecret,
        signOptions: {
          expiresIn: `${configService.authConfig.jwtExpirationTime}s`
        }
      }),
      inject: [ApiConfigService]
    }),
    DatabaseModule,
    UserModule,
    MailModule,
    OtpModule
  ],
  controllers: [AuthController, SocialController],
  providers: [
    AuthService,
    JwtStrategy,
    RedisModule,
    FacebookStrategy,
    GoogleStrategy,
    SocialService,
    OtpService
  ],
  exports: [AuthService]
})
export class AuthModule {}
