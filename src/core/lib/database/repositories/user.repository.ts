import { randomBytes } from 'crypto';
import { EntityRepository, Repository } from 'typeorm';

import { UserEntity } from '../entities';

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
  async checkExistRefCode(refCode: string): Promise<boolean> {
    const user = await this.findOne({ refCode });
    return !!user;
  }

  async getUserById(id: number): Promise<UserEntity> {
    return this.findOne({ id });
  }

  async updateUser(user: UserEntity, updateData: Partial<UserEntity>): Promise<UserEntity> {
    return this.save({ ...user, ...updateData });
  }

  async markLastLogin(userId: number): Promise<boolean> {
    await this.createQueryBuilder()
      .update()
      .set({ lastLogin: new Date(), nonce: randomBytes(32).toString('base64') })
      .where('id = :id', { id: userId })
      .execute();

    return true;
  }

  async minusScfBalance(userId: number, amount: number) {
    const userBal = await this.findOne({ id: userId }, { select: ['scfBalance'] });
    await this.createQueryBuilder()
      .update()
      .set({ scfBalance: () => `scf_balance - ${amount}` })
      .where('id = :id', { id: userId })
      .execute();

    return true;
  }

  async plusScfBalance(userId: number, amount: number) {
    await this.createQueryBuilder()
      .update()
      .set({ scfBalance: () => `scf_balance + ${amount}` })
      .where('id = :id', { id: userId })
      .execute();

    return true;
  }

  async increTotalInvestment(userId: number, amount: number) {
    await this.createQueryBuilder()
      .update()
      .set({ totalInvestment: () => `total_investment + ${amount}` })
      .where('id = :id', { id: userId })
      .execute();

    return true;
  }

  async increRevenue(userId: number, amount: number) {
    await this.createQueryBuilder()
      .update()
      .set({
        dayRevenue: () => `day_revenue + ${amount}`,
        totalRevenue: () => `total_revenue + ${amount}`,
      })
      .where('id = :id', { id: userId })
      .execute();

    return true;
  }

  async minusDayRevenue(userId: number, amount: number) {
    await this.createQueryBuilder()

      .update()
      .set({ dayRevenue: () => `day_revenue - ${amount}` })
      .where('id = :id', { id: userId })
      .execute();

    return true;
  }

  async resetDayRevenue() {
    await this.createQueryBuilder()
      .update()
      .set({
        dayRevenue: 0,
      })
      .where('day_revenue <> 0')
      .execute();

    return true;
  }

}
