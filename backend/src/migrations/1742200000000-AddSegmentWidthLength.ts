import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSegmentWidthLength1742200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE dimension_segment
       ADD COLUMN width  DECIMAL(10,4) NULL DEFAULT NULL,
       ADD COLUMN length DECIMAL(10,4) NULL DEFAULT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE dimension_segment DROP COLUMN width, DROP COLUMN length`
    );
  }
}
