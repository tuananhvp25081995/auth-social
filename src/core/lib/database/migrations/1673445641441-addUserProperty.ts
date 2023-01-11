import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class addUserProperty1673445641441 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("users", [
      new TableColumn({
        name: "first_name",
        type: "varchar",
        length: "100",
        isNullable: true,
      }),
      new TableColumn({
        name: "last_name",
        type: "varchar",
        length: "100",
        isNullable: true,
      }),
    ]);

    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns("users", ["first_name", "last_name"]);
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL;`
    );
  }
}
