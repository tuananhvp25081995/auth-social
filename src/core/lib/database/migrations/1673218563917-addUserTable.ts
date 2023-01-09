import type {MigrationInterface, QueryRunner} from "typeorm";
import { Table } from 'typeorm';

export class addUserTable1673218563917 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'users',
                columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isUnique: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    type: 'varchar',
                    name: 'email',
                    length: '60',
                    isNullable: false,
                    isUnique: true,
                },
                {
                    type: 'varchar',
                    name: 'username',
                    length: '100',
                    isNullable: false,
                    isUnique: true,
                },
                {
                    name: 'password',
                    type: 'text',
                    isNullable: false,
                },
                {
                    name: 'role',
                    type: 'varchar',
                    length: '20',
                    isNullable: false,
                },
                {
                    name: 'active',
                    type: 'boolean',
                    default: true,
                    isNullable: false,
                },
                {
                    name: 'secret',
                    type: 'varchar',
                    length: '100',
                    isNullable: false,
                },
                {
                    name: 'verified',
                    type: 'boolean',
                    default: false,
                    isNullable: false,
                },
                {
                    name: 'balance',
                    type: 'decimal(20,5)',
                    default: 0,
                    isNullable: false,
                },
                {
                    name: 'last_login',
                    type: 'timestamp',
                    isNullable: true,
                },
                {
                    name: 'active_2fa',
                    type: 'boolean',
                    default: false,
                    isNullable: false,
                },
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'now()',
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'now()',
                },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('users');
    }

}
