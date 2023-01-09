import { Controller, Get, UseGuards, HttpStatus, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { GoogleService } from '../services/google.service';
import { ApiConfigService } from 'src/core/shared/services';

@Controller('auth')
export class GoogleController {
  constructor(private readonly googleService: GoogleService, private readonly configService: ApiConfigService) {}
  @Get('/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {}

  @Get('/google/redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: Request) {
    
    const expiresTime = this.configService.authConfig.jwtRefreshExpirationDayTime * this.configService.timeConst.oneDayInMillisecond;
    req.session.cookie.originalMaxAge = expiresTime;
    req.session.cookie.maxAge = expiresTime;
    req.session.save();

    return this.googleService.googleLogin(req)
  }
}