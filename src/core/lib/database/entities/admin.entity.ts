import { BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admins')
export class AdminEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'id',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: '20',
    name: 'username',
    nullable: false,
  })
  username: string;

  @Column({
    type: 'text',
    name: 'password',
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
}
