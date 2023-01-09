import { randomBytes } from 'crypto';
import { EntityRepository, Repository } from 'typeorm';

import { UserEntity } from '../entities';

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {

  async getUserById(id: number): Promise<UserEntity> {
    return this.findOne({ id });
  }

  async updateUser(user: UserEntity, updateData: Partial<UserEntity>): Promise<UserEntity> {
    return this.save({ ...user, ...updateData });
  }

  async lastLogin(userId: number): Promise<boolean> {
    await this.createQueryBuilder()
      .update()
      .set({ lastLogin: new Date() })
      .where('id = :id', { id: userId })
      .execute();

    return true;
  }

}
