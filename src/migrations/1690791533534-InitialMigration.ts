import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1690791533534 implements MigrationInterface {
    name = 'InitialMigration1690791533534';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable UUID extension if not exists
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        
        // Create enum types first
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tasks_status_enum') THEN
                    CREATE TYPE "tasks_status_enum" AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tasks_priority_enum') THEN
                    CREATE TYPE "tasks_priority_enum" AS ENUM ('low', 'medium', 'high', 'urgent');
                END IF;
            END
            $$;
        `);
        // Create roles table with UUID
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "roles" (
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
        
        // Add comments to the roles table
        await queryRunner.query(`
            COMMENT ON TABLE "roles" IS 'Stores user roles and permissions';
            COMMENT ON COLUMN "roles"."id" IS 'Primary key';
            COMMENT ON COLUMN "roles"."name" IS 'Display name of the role';
            COMMENT ON COLUMN "roles"."code" IS 'Unique code identifier for the role';
            COMMENT ON COLUMN "roles"."description" IS 'Description of the role';
            COMMENT ON COLUMN "roles"."created_at" IS 'Timestamp when the record was created';
            COMMENT ON COLUMN "roles"."updated_at" IS 'Timestamp when the record was last updated';
        `);

        // Create users table with UUID
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "users" (
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
        
        // Add comments to the users table
        await queryRunner.query(`
            COMMENT ON TABLE "users" IS 'Stores user account information';
            COMMENT ON COLUMN "users"."id" IS 'Primary key';
            COMMENT ON COLUMN "users"."email" IS 'User email address (must be unique)';
            COMMENT ON COLUMN "users"."password_hash" IS 'Hashed password';
            COMMENT ON COLUMN "users"."first_name" IS 'User first name';
            COMMENT ON COLUMN "users"."last_name" IS 'User last name';
            COMMENT ON COLUMN "users"."role_id" IS 'Foreign key to roles table';
            COMMENT ON COLUMN "users"."is_active" IS 'Whether the user account is active';
            COMMENT ON COLUMN "users"."created_at" IS 'Timestamp when the user was created';
            COMMENT ON COLUMN "users"."updated_at" IS 'Timestamp when the user was last updated';
            COMMENT ON COLUMN "users"."deleted_at" IS 'Timestamp when the user was soft-deleted (if applicable)';
        `);

        // Add foreign key constraint after tables are created
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.table_constraints 
                    WHERE constraint_name = 'FK_users_role_id' 
                    AND table_name = 'users'
                ) THEN
                    ALTER TABLE "users" 
                    ADD CONSTRAINT "FK_users_role_id" 
                    FOREIGN KEY ("role_id") 
                    REFERENCES "roles" ("id") 
                    ON DELETE NO ACTION 
                    ON UPDATE NO ACTION;
                END IF;
            END
            $$;
        `);

        // Create tasks table with UUID and foreign key to users
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "tasks" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "title" VARCHAR NOT NULL,
                "description" TEXT,
                "status" "tasks_status_enum" NOT NULL DEFAULT 'pending',
                "priority" "tasks_priority_enum" NOT NULL DEFAULT 'low',
                "due_date" TIMESTAMP WITH TIME ZONE,
                "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "deleted_at" TIMESTAMP,
                "user_id" UUID,
                CONSTRAINT "UQ_tasks_title_user_id" UNIQUE ("title", "user_id") WHERE "deleted_at" IS NULL
            )
        `);
        
        // Add comments to the tasks table
        await queryRunner.query(`
            COMMENT ON TABLE "tasks" IS 'Stores task information';
            COMMENT ON COLUMN "tasks"."id" IS 'Primary key';
            COMMENT ON COLUMN "tasks"."title" IS 'Title of the task';
            COMMENT ON COLUMN "tasks"."description" IS 'Detailed description of the task';
            COMMENT ON COLUMN "tasks"."status" IS 'Current status of the task';
            COMMENT ON COLUMN "tasks"."priority" IS 'Priority level of the task';
            COMMENT ON COLUMN "tasks"."due_date" IS 'Due date for the task';
            COMMENT ON COLUMN "tasks"."created_at" IS 'Timestamp when the task was created';
            COMMENT ON COLUMN "tasks"."updated_at" IS 'Timestamp when the task was last updated';
            COMMENT ON COLUMN "tasks"."deleted_at" IS 'Timestamp when the task was soft-deleted (if applicable)';
            COMMENT ON COLUMN "tasks"."user_id" IS 'Foreign key to users table (task owner)';
        `);

        // Add foreign key constraint for tasks after table is created
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.table_constraints 
                    WHERE constraint_name = 'FK_tasks_user_id' 
                    AND table_name = 'tasks'
                ) THEN
                    ALTER TABLE "tasks" 
                    ADD CONSTRAINT "FK_tasks_user_id" 
                    FOREIGN KEY ("user_id") 
                    REFERENCES "users" ("id") 
                    ON DELETE SET NULL 
                    ON UPDATE NO ACTION;
                END IF;
            END
            $$;
        `);

        // Create indexes for better query performance
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_tasks_status" ON "tasks" ("status");
            CREATE INDEX IF NOT EXISTS "IDX_tasks_priority" ON "tasks" ("priority");
            CREATE INDEX IF NOT EXISTS "IDX_tasks_due_date" ON "tasks" ("due_date");
            CREATE INDEX IF NOT EXISTS "IDX_tasks_user_id" ON "tasks" ("user_id");
            CREATE INDEX IF NOT EXISTS "IDX_tasks_created_at" ON "tasks" ("created_at");
        `);
        
        // Create a function to automatically update the updated_at timestamp
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_modified_column() 
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW; 
            END;
            $$ LANGUAGE plpgsql;
        `);
        
        // Create triggers to update timestamps
        await queryRunner.query(`
            DO $$
            DECLARE
                t_record RECORD;
            BEGIN
                FOR t_record IN 
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_type = 'BASE TABLE'
                    AND table_name IN ('users', 'tasks')
                LOOP
                    EXECUTE format('
                        DROP TRIGGER IF EXISTS update_%s_modtime ON %I;
                        CREATE TRIGGER update_%s_modtime
                        BEFORE UPDATE ON %I
                        FOR EACH ROW EXECUTE FUNCTION update_modified_column();',
                        t_record.table_name, t_record.table_name,
                        t_record.table_name, t_record.table_name
                    );
                END LOOP;
            END
            $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop triggers first
        await queryRunner.query('DROP TRIGGER IF EXISTS prevent_schema_sync ON roles');
        await queryRunner.query('DROP TRIGGER IF EXISTS prevent_schema_sync_users ON users');
        await queryRunner.query('DROP TRIGGER IF EXISTS prevent_schema_sync_tasks ON tasks');
        
        // Drop function
        await queryRunner.query('DROP FUNCTION IF EXISTS prevent_schema_sync()');

        // Drop tables and types in reverse order
        await queryRunner.query('DROP TABLE IF EXISTS "tasks"');
        await queryRunner.query('DROP TYPE IF EXISTS "tasks_priority_enum"');
        await queryRunner.query('DROP TYPE IF EXISTS "tasks_status_enum"');
        await queryRunner.query('DROP TABLE IF EXISTS "users"');
        await queryRunner.query('DROP TABLE IF EXISTS "roles"');
    }
}
