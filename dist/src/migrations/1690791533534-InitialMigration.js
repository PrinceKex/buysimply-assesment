"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialMigration1690791533534 = void 0;
class InitialMigration1690791533534 {
    constructor() {
        this.name = 'InitialMigration1690791533534';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" VARCHAR NOT NULL,
                "code" VARCHAR NOT NULL,
                "description" VARCHAR NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "UQ_roles_name" UNIQUE ("name"),
                CONSTRAINT "UQ_roles_code" UNIQUE ("code")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "email" VARCHAR NOT NULL,
                "password_hash" VARCHAR NOT NULL,
                "first_name" VARCHAR,
                "last_name" VARCHAR,
                "role_id" UUID NOT NULL,
                "is_active" BOOLEAN NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "deleted_at" TIMESTAMP,
                CONSTRAINT "UQ_users_email" UNIQUE ("email")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD CONSTRAINT "FK_users_role_id" 
            FOREIGN KEY ("role_id") 
            REFERENCES "roles" ("id") 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            CREATE TYPE "tasks_status_enum" AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
            CREATE TYPE "tasks_priority_enum" AS ENUM ('low', 'medium', 'high', 'urgent');

            CREATE TABLE "tasks" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "title" VARCHAR NOT NULL,
                "description" VARCHAR,
                "status" "tasks_status_enum" NOT NULL DEFAULT 'pending',
                "priority" "tasks_priority_enum" NOT NULL DEFAULT 'low',
                "due_date" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "deleted_at" TIMESTAMP,
                "user_id" UUID
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "tasks" 
            ADD CONSTRAINT "FK_tasks_user_id" 
            FOREIGN KEY ("user_id") 
            REFERENCES "users" ("id") 
            ON DELETE SET NULL 
            ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TRIGGER IF EXISTS prevent_schema_sync ON roles');
        await queryRunner.query('DROP TRIGGER IF EXISTS prevent_schema_sync_users ON users');
        await queryRunner.query('DROP TRIGGER IF EXISTS prevent_schema_sync_tasks ON tasks');
        await queryRunner.query('DROP FUNCTION IF EXISTS prevent_schema_sync()');
        await queryRunner.query('DROP TABLE IF EXISTS "tasks"');
        await queryRunner.query('DROP TYPE IF EXISTS "tasks_priority_enum"');
        await queryRunner.query('DROP TYPE IF EXISTS "tasks_status_enum"');
        await queryRunner.query('DROP TABLE IF EXISTS "users"');
        await queryRunner.query('DROP TABLE IF EXISTS "roles"');
    }
}
exports.InitialMigration1690791533534 = InitialMigration1690791533534;
//# sourceMappingURL=1690791533534-InitialMigration.js.map