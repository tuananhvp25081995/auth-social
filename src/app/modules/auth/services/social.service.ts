import { Injectable } from "@nestjs/common";
import { faker } from "@faker-js/faker";
import { JwtService } from "@nestjs/jwt";
import {
  TokenRepository,
  UserRepository
} from "src/core/lib/database/repositories";
import { ApiConfigService } from "src/core/shared/services";
import { EntityManager, Transaction, TransactionManager } from "typeorm";
import { AuthTokenPayload, UserRole } from "../interface";
import { OtpService } from "src/core/lib/otp";
import { TokenType } from "../../../../common/enum";
import moment from "moment";

@Injectable()
export class SocialService {
  constructor(
    private jwtService: JwtService,
    private readonly userRepos: UserRepository,
    private apiConfigService: ApiConfigService,
    private readonly tokenRepos: TokenRepository,
    private readonly otpService: OtpService
  ) {}

  @Transaction()
  async socialLogin(req, @TransactionManager() manager: EntityManager = null) {
    if (!req.user) {
      throw new Error("No user from social");
    }
    let user = await this.userRepos.findOne({
      email: String(req.user.email).toLowerCase()
    });
    if (!user) {
      // const userSecret = this.otpService.generateUniqueSecret();
      user = await manager.getCustomRepository(UserRepository).save({
        email: String(req.user.email).toLocaleLowerCase(),
        username: faker.internet.userName(),
        firstName: String(req.user.firstName),
        lastName: String(req.user.lastName),
        secret: "userSecret",
        role: UserRole.USER
      });
    }

    await this.userRepos.lastLogin(user.id);
    const payload: AuthTokenPayload = {
      sub: user.id,
      email: user.email,
      role: UserRole.USER
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: moment()
        .add(
          this.apiConfigService.authConfig.jwtRefreshExpirationDayTime,
          "days"
        )
        .unix()
    });

    await this.tokenRepos.save({
      token: refreshToken,
      userId: user.id,
      type: TokenType.REFRESH_TOKEN,
      expires: moment()
        .add(
          this.apiConfigService.authConfig.jwtRefreshExpirationDayTime,
          "days"
        )
        .toDate()
    });

    return {
      accessToken,
      refreshToken
    };
  }
}
