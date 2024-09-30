import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedRoles1685239838362 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "role" ("name")
      VALUES ('user'), ('admin')
      ON CONFLICT ("name") DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "role"
      WHERE "name" IN ('user', 'admin');
    `);
  }
}
