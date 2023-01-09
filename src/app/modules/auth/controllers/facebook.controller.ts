import { Controller, Get, UseGuards, HttpStatus, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ApiConfigService } from 'src/core/shared/services';

@Controller('auth')
export class FacebookController {
  constructor(private readonly configService: ApiConfigService) {}

  @Get('/facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin(): Promise<any>  {
    return HttpStatus.OK;
  }

  @Get('/facebook/redirect')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginRedirect(@Req() req: Request): Promise<any> {

    const expiresTime = this.configService.authConfig.jwtRefreshExpirationDayTime * this.configService.timeConst.oneDayInMillisecond;
    req.session.cookie.originalMaxAge = expiresTime;
    req.session.cookie.maxAge = expiresTime;
    req.session.save();
    
    return {
      statusCode: HttpStatus.OK,
      data: req.user,
    };
  }

}