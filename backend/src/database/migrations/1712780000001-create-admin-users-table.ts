import { hash } from 'bcryptjs';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdminUsersTable1712780000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "admin_users" (
        "id" SERIAL NOT NULL,
        "username" character varying(255) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_admin_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_admin_users_username" UNIQUE ("username")
      );
    `);

    const username = process.env.ADMIN_USERNAME?.trim() || 'admin';
    const password = process.env.ADMIN_PASSWORD?.trim() || 'admin';
    const passwordHash = await hash(password, 10);

    await queryRunner.query(
      `
        INSERT INTO "admin_users" ("username", "password_hash")
        VALUES ($1, $2)
        ON CONFLICT ("username")
        DO UPDATE SET
          "password_hash" = EXCLUDED."password_hash",
          "updated_at" = now();
      `,
      [username, passwordHash],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "admin_users";`);
  }
}
