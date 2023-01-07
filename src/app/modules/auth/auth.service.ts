/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import moment from 'moment';
import { Model } from 'mongoose';
import { RedisService } from 'src/core/lib';
import { User, UserEntity } from 'src/core/lib/database';
import { TokenRepository, UserRepository } from 'src/core/lib/database/repositories';
import { OtpService } from 'src/core/lib/otp';
import { ApiConfigService } from 'src/core/shared/services';
import { EntityManager, Transaction, TransactionManager } from 'typeorm';

import { TokenType } from '../../../common/enum';
import { UserService } from '../user';
import type { LoginDto, RegisterDto } from './dto';
import { AuthTokenPayload, UserRole } from './interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private apiConfigService: ApiConfigService,
    private readonly userRepos: UserRepository,
    private readonly tokenRepos: TokenRepository,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly otpService: OtpService,
    private readonly redis: RedisService,
    private readonly userService: UserService,
  ) {}

  async login(params: LoginDto) {
    const user = await this.userRepos.findOne({
      // publicAddress: String(params.publicAddress).toLowerCase(),
    });

    if (!user) {
      throw new Error('User not found!');
    }

    // // eslint-disable-next-line max-len
    // const msg = `Sign this message for authenticating with your wallet. Nonce: ${user.nonce}`; // this make user can only sign-in one place at one time

    // const msgBufferHex = bufferToHex(Buffer.from(msg, 'utf8'));
    // const address = recoverPersonalSignature({
    //   data: msgBufferHex,
    //   sig: params.signature,
    // });

    // if (address.toLowerCase() !== user.publicAddress.toLowerCase()) {
    //   throw new Error('Invalid signature');
    // }

    await this.userRepos.markLastLogin(user.id);

    const payload: AuthTokenPayload = {
      sub: user.id,
      publicAddress: user.publicAddress,
      role: UserRole.USER,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: moment().add(this.apiConfigService.authConfig.jwtRefreshExpirationDayTime, 'days').unix(),
    });

    await this.tokenRepos.save({
      token: refreshToken,
      userId: user.id,
      type: TokenType.REFRESH_TOKEN,
      expires: moment().add(this.apiConfigService.authConfig.jwtRefreshExpirationDayTime, 'days').toDate(),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  @Transaction()
  async register(registerData: RegisterDto, @TransactionManager() manager: EntityManager = null) {
    const existUser = await manager.getCustomRepository(UserRepository).findOne({
      // publicAddress: String(registerData.publicAddress).toLowerCase(),
    });

    if (existUser) {
      throw new Error('User already exist!');
    }

    let refCode: string;
    let existRefCode: boolean;
    do {
      refCode = randomBytes(4).toString('hex').toUpperCase();

      existRefCode = await manager.getCustomRepository(UserRepository).checkExistRefCode(refCode);
    } while (existRefCode);

    // if (registerData?.refCode) {
    //   const existParentRefCode = await manager
    //     .getCustomRepository(UserRepository)
    //     .checkExistRefCode(registerData.refCode);

    //   if (!existParentRefCode) {
    //     throw new Error('Parent ref code not found!');
    //   }
    // }

    const userSecret = this.otpService.generateUniqueSecret();

    const user = await manager.getCustomRepository(UserRepository).save({
      publicAddress: String(registerData.publicAddress).toLowerCase(),
      nickName: faker.name.fullName(),
      referralCodeApplied: registerData?.refCode || this.apiConfigService.defaultRef,
      refCode,
      secret: userSecret,
      nonce: randomBytes(32).toString('base64'),
    });

    delete user.secret;
    delete user.active;
    delete user.blockWithdraw;

    await this.saveRefMongoDB(user);
    return user;
  }

  async saveRefMongoDB(user: UserEntity) {
    const parentRefUser = await this.userModel.findOne({
      refCode: user.referralCodeApplied,
    });

    const newRefUser = await this.userModel.create({
      publicAddress: String(user.publicAddress).toLowerCase(),
      refCode: user.refCode,
      parentRefCode: parentRefUser?.refCode,
      parentPublicAddress: parentRefUser?.publicAddress ? String(parentRefUser.publicAddress).toLowerCase() : null,
    });

    if (parentRefUser) {
      await this.userModel.updateOne(
        {
          _id: parentRefUser._id,
        },
        {
          $addToSet: {
            child: String(newRefUser.publicAddress).toLowerCase(),
          },
        },
      );
    }

    return newRefUser;
  }

  async refreshToken(refreshToken: string) {
    const tokenDecode = this.jwtService.decode(refreshToken) as { sub: number; publicAddress: string };
    const tokenResult = await this.tokenRepos.findOne({
      where: {
        token: refreshToken,
        userId: tokenDecode?.sub,
        type: TokenType.REFRESH_TOKEN,
        blacklisted: false,
      },
    });

    if (!tokenResult) {
      throw new Error('Invalid refresh token');
    }

    const user = await this.userRepos.findOne({
      where: {
        id: tokenResult.userId,
      },
    });

    if (!user) {
      throw new Error('User not found!');
    }

    const payload: AuthTokenPayload = {
      sub: user.id,
      publicAddress: user.publicAddress,
      role: UserRole.USER,
    };

    const newRefreshToken = this.jwtService.sign(payload, {
      expiresIn: moment().add(this.apiConfigService.authConfig.jwtRefreshExpirationDayTime, 'days').unix(),
    });

    const newToken = this.jwtService.sign(payload);

    await this.tokenRepos.save({
      token: refreshToken,
      userId: user.id,
      type: TokenType.REFRESH_TOKEN,
      expires: moment().add(this.apiConfigService.authConfig.jwtRefreshExpirationDayTime, 'days').toDate(),
    });

    return {
      accessToken: newToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    const tokenDecode = this.jwtService.decode(refreshToken) as { sub: number; publicKey: string };

    if (!tokenDecode?.sub) {
      throw new Error('Invalid refresh token');
    }

    const tokenResult = await this.tokenRepos.findOne({
      token: refreshToken,
      userId: tokenDecode.sub,
      type: TokenType.REFRESH_TOKEN,
      blacklisted: false,
    });

    if (!tokenResult) {
      throw new Error('Invalid refresh token');
    }

    await this.tokenRepos.delete({
      token: refreshToken,
      userId: tokenDecode.sub,
      type: TokenType.REFRESH_TOKEN,
      blacklisted: false,
    });

    return true;
  }

  async publicAddressAvailability(publicAddress: string) {
    const existUser = await this.userRepos.findOne({
      publicAddress: String(publicAddress).toLowerCase(),
    });

    return {
      exist: Boolean(existUser),
      nonce: existUser?.nonce,
    };
  }
}
