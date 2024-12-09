import { MigrationInterface, QueryRunner } from "typeorm";

export class FollowersAdded1728890528080 implements MigrationInterface {
    name = 'FollowersAdded1728890528080'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "followers" ("id" SERIAL NOT NULL, "followedAt" TIMESTAMP NOT NULL DEFAULT now(), "followerId" integer, "followeeId" integer, CONSTRAINT "PK_c90cfc5b18edd29bd15ba95c1a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "followers" ADD CONSTRAINT "FK_451bb9eb792c3023a164cf14e0a" FOREIGN KEY ("followerId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "followers" ADD CONSTRAINT "FK_8cdffcc8ac31a11bee057fce95d" FOREIGN KEY ("followeeId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "followers" DROP CONSTRAINT "FK_8cdffcc8ac31a11bee057fce95d"`);
        await queryRunner.query(`ALTER TABLE "followers" DROP CONSTRAINT "FK_451bb9eb792c3023a164cf14e0a"`);
        await queryRunner.query(`DROP TABLE "followers"`);
    }

}
