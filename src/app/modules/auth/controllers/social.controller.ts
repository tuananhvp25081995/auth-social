import { Controller, Get, UseGuards, HttpStatus, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ApiConfigService } from 'src/core/shared/services';
import { SocialService } from '../services/social.service';

@Controller('auth')
export class SocialController {
  constructor(
    private readonly configService: ApiConfigService,
    private readonly socialService: SocialService,
  ) {}

  @Get('/facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin(): Promise<any>  {
    return HttpStatus.OK;
  }

  @Get('/facebook/redirect')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginRedirect(@Req() req: Request): Promise<any> {
    
    const result = await this.socialService.socialLogin(req.user);

    const expiresTime = this.configService.authConfig.jwtRefreshExpirationDayTime * this.configService.timeConst.oneDayInMillisecond;

    req.session.refreshToken = result.refreshToken;
    req.session.cookie.originalMaxAge = expiresTime;
    req.session.cookie.maxAge = expiresTime;
    req.session.save();

    return { accessToken: result.accessToken };
  }

  @Get('/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(): Promise<any>  {
    return HttpStatus.OK;
  }

  @Get('/google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request) {
    
    const result = await this.socialService.socialLogin(req);

    const expiresTime = this.configService.authConfig.jwtRefreshExpirationDayTime * this.configService.timeConst.oneDayInMillisecond;

    req.session.refreshToken = result.refreshToken;
    req.session.cookie.originalMaxAge = expiresTime;
    req.session.cookie.maxAge = expiresTime;
    req.session.save();

    return { accessToken: result.accessToken };
  }

}