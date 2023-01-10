/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import moment from 'moment';
import { Model } from 'mongoose';
import { RedisService } from 'src/core/lib';
import { User } from 'src/core/lib/database';
import { TokenRepository, UserRepository } from 'src/core/lib/database/repositories';
import { OtpService } from 'src/core/lib/otp';
import { ApiConfigService } from 'src/core/shared/services';
import { EntityManager, Transaction, TransactionManager } from 'typeorm';
import * as argon from 'argon2';
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
    private readonly otpService: OtpService,
  ) {}

  async login(params: LoginDto) {
    let user = await this.userRepos.findOne({
      username: String(params.username).toLowerCase(),
    });

    if (!user) {
      user = await this.userRepos.findOne({
        email: String(params.username).toLowerCase(),
      });
    }
    
    if (!user) {
      throw new Error('User not found!');
    }

    const passwordMatched = await argon.verify(
      user.password,
      params.password
    )  

    if(!passwordMatched) {
      throw new ForbiddenException(
        'Incorrect password'
      )
    }
    await this.userRepos.lastLogin(user.id);

    const payload: AuthTokenPayload = {
      sub: user.id,
      username: user.username,
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
    const hashedPassword = await argon.hash(String(registerData.password));
    const existUserName = await manager.getCustomRepository(UserRepository).findOne({
      username: String(registerData.username).toLowerCase(),
    });

    if (existUserName) {
      throw new Error('username already exist!');
    }

    const existEmail = await manager.getCustomRepository(UserRepository).findOne({
      email: String(registerData.email).toLowerCase(),
    });

    if (existEmail) {
      throw new Error('email already exist!');
    }

    const userSecret = this.otpService.generateUniqueSecret();

    const user = await manager.getCustomRepository(UserRepository).save({
      email: String(registerData.email).toLocaleLowerCase(),
      username: String(registerData.username).toLowerCase(),
      password: hashedPassword,
      secret: userSecret,
      role: UserRole.USER,
    });

    delete user.secret;
    delete user.active;

    return user;
  }

  async refreshToken(refreshToken: string) {
    const tokenDecode = this.jwtService.decode(refreshToken) as { sub: number; username: string };
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
      username: user.username,
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
}
