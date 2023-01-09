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
    name: 'email',
    length: 100,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    name: 'username',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  username: string;

  @Column({
    name: 'password',
    type: 'text',
    nullable: false,
  })
  password: string;

  @Column({
    type: 'varchar',
    length: '20',
    name: 'role',
    nullable: false,
  })
  role: string;

  @Column({
    type: 'boolean',
    name: 'active',
    default: true,
    nullable: false,
  })
  active: boolean;

  @Column({
    name: 'secret',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  secret: string;

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
    type: 'timestamp',
    name: 'last_login',
    nullable: true,
  })
  lastLogin: Date;

  @Column({
    name: 'active_2fa',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  active2fa: boolean;

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
