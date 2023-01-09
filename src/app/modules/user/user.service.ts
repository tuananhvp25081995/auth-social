/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import {
  UserRepository,
} from 'src/core/lib/database/repositories';
import { ApiConfigService } from 'src/core/shared/services';
import { EntityManager, In, MoreThanOrEqual, Transaction, TransactionManager } from 'typeorm';

import type { UpdateUserDto } from './dto';

@Injectable()
export class UserService {

  constructor(
    private readonly userRepos: UserRepository,
  ) {}

  async getUserProfile(id: number) {
    const user = await this.userRepos.findOne(id);

    if (!user) {
      throw new Error('User not found');
    }
    
    delete user.password;
    delete user.secret;
    delete user.active;

    return user;
  }

  async findOne(id: number) {
    return this.userRepos.findOne(id);
  }

  async updateUser(user: { id: number }, updateData: UpdateUserDto) {
    const userData = await this.userRepos.findOne({
      id: user.id,
    });

    if (!userData) {
      throw new Error('User not found');
    }

    return this.userRepos.save({ id: user.id, ...updateData });
  }
}
