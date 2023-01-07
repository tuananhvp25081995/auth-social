import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isNil } from 'lodash';

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  private getNumber(key: string): number {
    const value = this.get(key);

    try {
      return Number(value);
    } catch {
      throw new Error(key + ' environment variable is not a number');
    }
  }

  private getBoolean(key: string): boolean {
    const value = this.get(key);

    try {
      return Boolean(JSON.parse(value));
    } catch {
      throw new Error(key + ' env var is not a boolean');
    }
  }

  private getString(key: string): string {
    const value = this.get(key);

    return value.replace(/\\n/g, '\n');
  }

  get nodeEnv(): string {
    return this.getString('NODE_ENV');
  }

  checkExistEnv(key: string): boolean {
    return isNil(this.configService.get(key)) ? false : true;
  }

  private get(key: string): string {
    const value = this.configService.get<string>(key);

    if (isNil(value)) {
      throw new Error(key + ' environment variable does not set');
    }

    return value;
  }

  get fallbackLanguage(): string {
    return this.getString('FALLBACK_LANGUAGE');
  }

  get documentationEnabled(): boolean {
    return this.getBoolean('ENABLE_DOCUMENTATION');
  }

  get domainWhitelist(): string[] {
    return this.getString('DOMAIN_WHITELIST').split(',');
  }

  get defaultRef(): string {
    return this.getString('DEFAULT_REF');
  }

  get authConfig() {
    return {
      jwtSecret: this.getString('JWT_SECRET'),
      jwtExpirationTime: this.getNumber('JWT_EXPIRATION_TIME'),
      jwtRefreshExpirationDayTime: this.getNumber('JWT_REFRESH_EXPIRATION_DAY_TIME'),
      sessionSecret: this.getString('SESSION_SECRET'),
    };
  }

  get timeConst() {
    return {
      oneDayInMillisecond: 24 * 60 * 60 * 1000,
      oneHourInMillisecond: 60 * 60 * 1000,
      oneMinuteInMillisecond: 60 * 1000,
    };
  }

  get appConfig() {
    return {
      port: this.getString('PORT'),
      clientUrl: this.getString('CLIENT_URL'),
      appName: this.getString('APP_NAME'),
    };
  }

  get redisConfig() {
    return {
      host: this.getString('REDISDB_HOST'),
      port: this.getNumber('REDISDB_PORT'),
      db: this.getNumber('REDISDB_INDEX'),
      url: `redis://${this.getString('REDISDB_HOST')}:${this.getNumber('REDISDB_PORT')}`,
    };
  }

  get postgresConfig() {
    return {
      host: this.getString('POSTGRES_HOST'),
      port: this.getNumber('POSTGRES_PORT'),
      db: this.getString('POSTGRES_DB'),
      user: this.getString('POSTGRES_USER'),
      pass: this.getString('POSTGRES_PASS'),
      loggingEnable: ['development'].includes(this.getString('NODE_ENV')),
    };
  }

  get mailConfig() {
    return {
      host: this.getString('MAIL_SERVER_HOST'),
      port: this.getNumber('MAIL_SERVER_PORT'),
      user: this.getString('MAIL_SERVER_USER'),
      pass: this.getString('MAIL_SERVER_PASS'),
      from: this.getString('MAIL_FROM'),
    };
  }

  get mongoURL(): string {
    return this.getString('MONGODB_URL');
  }

  get blockChainConfig() {
    return {
      chainId: this.getString('APP_CHAIN_ID'),
      rpcURL: this.getString('RPC_URL'),
      contractAddress: this.getString('CONTRACT_ADDRESS'),
      busdContractAddress: this.getString('BUSD_CONTRACT_ADDRESS'),
      usdtContractAddress: this.getString('USDT_CONTRACT_ADDRESS'),
      scfContractAddress: this.getString('SCF_CONTRACT_ADDRESS'),
    };
  }
}
