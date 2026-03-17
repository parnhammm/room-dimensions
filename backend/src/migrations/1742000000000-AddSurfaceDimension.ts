import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSurfaceDimension1742000000000 implements MigrationInterface {
  name = 'AddSurfaceDimension1742000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`surface_dimension\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`surfaceType\` enum('floor','ceiling') NOT NULL,
        \`width\` decimal(10,4) NOT NULL,
        \`length\` decimal(10,4) NOT NULL,
        \`roomId\` int NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_surface_dimension_room_surface\` (\`roomId\`, \`surfaceType\`),
        CONSTRAINT \`FK_surface_dimension_room\` FOREIGN KEY (\`roomId\`) REFERENCES \`room\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`surface_dimension\``);
  }
}
