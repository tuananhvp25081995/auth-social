import type {MigrationInterface, QueryRunner} from "typeorm";
import { Table } from 'typeorm';

export class addTokenTable1673220137681 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
              name: 'tokens',
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
                  type: 'text',
                  name: 'token',
                  isNullable: false,
                  isUnique: true,
                },
                {
                  type: 'varchar',
                  name: 'type',
                  length: '20',
                  isNullable: false,
                },
                {
                  name: 'user_id',
                  type: 'int',
                  isNullable: false,
                },
                {
                  type: 'timestamp',
                  name: 'expires',
                  isNullable: false,
                },
                {
                  type: 'boolean',
                  name: 'blacklisted',
                  default: false,
                },
              ],
            }),
            true,
          );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('tokens');
    }

}
