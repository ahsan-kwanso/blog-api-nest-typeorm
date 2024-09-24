import { MigrationInterface, QueryRunner } from "typeorm";

export class Test2Mig1727174285286 implements MigrationInterface {
    name = 'Test2Mig1727174285286'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Comments" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "UserId" integer NOT NULL, "PostId" integer NOT NULL, "ParentCommentId" integer, "content" character varying(100) NOT NULL, CONSTRAINT "PK_91e576c94d7d4f888c471fb43de" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Posts" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "UserId" integer NOT NULL, "title" character varying(50) NOT NULL, "content" character varying(500) NOT NULL, CONSTRAINT "PK_0f050d6d1112b2d07545b43f945" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_ae4578dcaed5adff96595e61660" UNIQUE ("name"), CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Users" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(50) NOT NULL, "email" character varying(50) NOT NULL, "password" character varying(100) NOT NULL, "RoleId" integer NOT NULL DEFAULT '1', "isVerified" boolean NOT NULL DEFAULT false, "verificationToken" character varying, "profilePictureUrl" character varying(550), CONSTRAINT "UQ_3c3ab3f49a87e6ddb607f3c4945" UNIQUE ("email"), CONSTRAINT "PK_16d4f7d636df336db11d87413e3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Comments" ADD CONSTRAINT "FK_aec877302044dad89b9934d756d" FOREIGN KEY ("UserId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Comments" ADD CONSTRAINT "FK_a8eb58641f39ceb392ee09301d1" FOREIGN KEY ("PostId") REFERENCES "Posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Comments" ADD CONSTRAINT "FK_e6a545f7b56be83df4aea4b25a7" FOREIGN KEY ("ParentCommentId") REFERENCES "Comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Posts" ADD CONSTRAINT "FK_7de6947490541a532143a8805a8" FOREIGN KEY ("UserId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Users" ADD CONSTRAINT "FK_1abb40f1fe8e092337c8f46d1c6" FOREIGN KEY ("RoleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" DROP CONSTRAINT "FK_1abb40f1fe8e092337c8f46d1c6"`);
        await queryRunner.query(`ALTER TABLE "Posts" DROP CONSTRAINT "FK_7de6947490541a532143a8805a8"`);
        await queryRunner.query(`ALTER TABLE "Comments" DROP CONSTRAINT "FK_e6a545f7b56be83df4aea4b25a7"`);
        await queryRunner.query(`ALTER TABLE "Comments" DROP CONSTRAINT "FK_a8eb58641f39ceb392ee09301d1"`);
        await queryRunner.query(`ALTER TABLE "Comments" DROP CONSTRAINT "FK_aec877302044dad89b9934d756d"`);
        await queryRunner.query(`DROP TABLE "Users"`);
        await queryRunner.query(`DROP TABLE "role"`);
        await queryRunner.query(`DROP TABLE "Posts"`);
        await queryRunner.query(`DROP TABLE "Comments"`);
    }

}
