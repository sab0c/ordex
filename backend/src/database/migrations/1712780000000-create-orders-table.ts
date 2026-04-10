import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrdersTable1712780000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        CREATE TYPE "public"."orders_status_enum" AS ENUM (
          'Aberta',
          'Em andamento',
          'Concluída',
          'Cancelada'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END
      $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" SERIAL NOT NULL,
        "cliente" character varying(255) NOT NULL,
        "descricao" text NOT NULL,
        "valor_estimado" numeric(10,2) NOT NULL,
        "status" "public"."orders_status_enum" NOT NULL DEFAULT 'Aberta',
        "data_criacao" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "data_atualizacao" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_orders_id" PRIMARY KEY ("id")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "orders";`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."orders_status_enum";`,
    );
  }
}
