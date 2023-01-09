import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/core/guards';

import { UpdateUserDto } from './dto';
import { UserService } from './user.service';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    
    const user = req.user;
    const result = await this.userService.getUserProfile(user.id);

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/')
  async updateProfile(@Body() updateData: UpdateUserDto, @Req() req: Request) {
    const result = await this.userService.updateUser(req.user, updateData);

    return result;
  }
}
