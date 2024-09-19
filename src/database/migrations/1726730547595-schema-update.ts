import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1726730547595 implements MigrationInterface {
    name = 'SchemaUpdate1726730547595'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Comments" ("id" SERIAL NOT NULL, "UserId" integer NOT NULL, "PostId" integer NOT NULL, "ParentCommentId" integer, "content" character varying(100) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_91e576c94d7d4f888c471fb43de" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Posts" ("id" SERIAL NOT NULL, "UserId" integer NOT NULL, "title" character varying(50) NOT NULL, "content" character varying(500) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0f050d6d1112b2d07545b43f945" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Users" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, "email" character varying(50) NOT NULL, "password" character varying(100) NOT NULL, "role" "public"."Users_role_enum" NOT NULL DEFAULT 'user', "isVerified" boolean NOT NULL DEFAULT false, "verificationCode" character varying, "profilePictureUrl" character varying(255), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3c3ab3f49a87e6ddb607f3c4945" UNIQUE ("email"), CONSTRAINT "PK_16d4f7d636df336db11d87413e3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Comments" ADD CONSTRAINT "FK_aec877302044dad89b9934d756d" FOREIGN KEY ("UserId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Comments" ADD CONSTRAINT "FK_a8eb58641f39ceb392ee09301d1" FOREIGN KEY ("PostId") REFERENCES "Posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Comments" ADD CONSTRAINT "FK_e6a545f7b56be83df4aea4b25a7" FOREIGN KEY ("ParentCommentId") REFERENCES "Comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Posts" ADD CONSTRAINT "FK_7de6947490541a532143a8805a8" FOREIGN KEY ("UserId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Posts" DROP CONSTRAINT "FK_7de6947490541a532143a8805a8"`);
        await queryRunner.query(`ALTER TABLE "Comments" DROP CONSTRAINT "FK_e6a545f7b56be83df4aea4b25a7"`);
        await queryRunner.query(`ALTER TABLE "Comments" DROP CONSTRAINT "FK_a8eb58641f39ceb392ee09301d1"`);
        await queryRunner.query(`ALTER TABLE "Comments" DROP CONSTRAINT "FK_aec877302044dad89b9934d756d"`);
        await queryRunner.query(`DROP TABLE "Users"`);
        await queryRunner.query(`DROP TABLE "Posts"`);
        await queryRunner.query(`DROP TABLE "Comments"`);
    }

}
