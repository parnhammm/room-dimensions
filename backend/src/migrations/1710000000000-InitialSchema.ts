import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1710000000000 implements MigrationInterface {
  name = 'InitialSchema1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`room\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`label\` varchar(255) NOT NULL,
        \`floor\` varchar(100) NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`dimension_segment\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`label\` varchar(255) NOT NULL,
        \`measurement\` decimal(10,4) NOT NULL,
        \`surfaceType\` enum('floor','ceiling') NOT NULL,
        \`roomId\` int NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_segment_room\` FOREIGN KEY (\`roomId\`) REFERENCES \`room\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`wall\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`label\` varchar(255) NOT NULL,
        \`width\` decimal(10,4) NOT NULL,
        \`height\` decimal(10,4) NOT NULL,
        \`roomId\` int NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_wall_room\` FOREIGN KEY (\`roomId\`) REFERENCES \`room\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`window\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`label\` varchar(255) NOT NULL,
        \`width\` decimal(10,4) NOT NULL,
        \`height\` decimal(10,4) NOT NULL,
        \`wallId\` int NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_window_wall\` FOREIGN KEY (\`wallId\`) REFERENCES \`wall\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`app_settings\` (
        \`id\` int NOT NULL,
        \`measurementUnit\` enum('m','cm','ft','in') NOT NULL DEFAULT 'm',
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Seed singleton AppSettings row
    await queryRunner.query(`
      INSERT INTO \`app_settings\` (\`id\`, \`measurementUnit\`) VALUES (1, 'm')
      ON DUPLICATE KEY UPDATE \`id\` = \`id\`
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`window\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`wall\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`dimension_segment\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`app_settings\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`room\``);
  }
}
