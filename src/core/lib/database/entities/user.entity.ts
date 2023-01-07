import { BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { TokenEntity } from './token.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'id',
    unsigned: true,
  })
  id: number;

  @Column({
    type: 'varchar',
    name: 'nick_name',
    length: 100,
    nullable: false,
    unique: true,
  })
  nickName: string;

  @Column({
    name: 'public_address',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  publicAddress: string;

  @Column({
    name: 'nonce',
    type: 'text',
    nullable: false,
  })
  nonce: string;

  @Column({
    type: 'boolean',
    name: 'active',
    default: true,
    nullable: false,
  })
  active: boolean;

  @Column({
    type: 'decimal',
    name: 'balance',
    precision: 20,
    scale: 5,
    default: 0,
    nullable: false,
  })
  balance: number;

  @Column({
    type: 'decimal',
    name: 'scf_balance',
    precision: 20,
    scale: 5,
    default: 0,
    nullable: false,
  })
  scfBalance: number;

  @Column({
    type: 'timestamp',
    name: 'last_login',
    nullable: true,
  })
  lastLogin: Date;

  @Column({
    type: 'decimal',
    name: 'deposit_amount',
    precision: 20,
    scale: 5,
    default: 0,
    nullable: false,
  })
  depositAmount: number;

  @Column({
    type: 'decimal',
    name: 'withdraw_amount',
    precision: 20,
    scale: 5,
    default: 0,
    nullable: false,
  })
  withdrawAmount: number;

  @Column({
    type: 'decimal',
    name: 'commission_amount',
    precision: 20,
    scale: 5,
    default: 0,
    nullable: false,
  })
  commissionAmount: number;

  @Column({
    type: 'decimal',
    name: 'total_investment',
    precision: 20,
    scale: 5,
    default: 0,
    nullable: false,
  })
  totalInvestment: number;

  @Column({
    type: 'decimal',
    name: 'total_revenue',
    precision: 20,
    scale: 5,
    default: 0,
    nullable: false,
  })
  totalRevenue: number;

  @Column({
    type: 'decimal',
    name: 'day_revenue',
    precision: 20,
    scale: 5,
    default: 0,
    nullable: false,
  })
  dayRevenue: number;

  @Column({
    type: 'varchar',
    name: 'ref_code',
    length: 100,
    nullable: false,
  })
  refCode: string;

  @Column({
    type: 'varchar',
    name: 'referral_code_applied',
    length: 100,
    nullable: false,
  })
  referralCodeApplied: string;

  @Column({
    name: 'secret',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  secret: string;

  @Column({
    name: 'level',
    type: 'int',
    nullable: false,
    default: 0,
  })
  level: number;

  @Column({
    name: 'active_2fa',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  active2fa: boolean;

  @Column({
    name: 'block_withdraw',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  blockWithdraw: boolean;

  @Column({
    name: 'min_level',
    type: 'int',
    nullable: true,
  })
  minLevel: number;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @BeforeUpdate()
  updateDates() {
    this.updatedAt = new Date();
  }

  @OneToMany(() => TokenEntity, (token) => token.user)
  tokens: TokenEntity[];
}
