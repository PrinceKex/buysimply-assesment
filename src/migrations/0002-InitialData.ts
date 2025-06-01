import * as bcrypt from 'bcryptjs';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialData0002170000000000 implements MigrationInterface {
    name = 'InitialData0002170000000000';

    private async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('=== Starting initial data migration ===');
        
        // First, ensure the roles table exists
        const rolesTableExists = await queryRunner.query(
            `SELECT to_regclass('public.roles') as exists`
        );
        
        if (!rolesTableExists[0].exists) {
            console.log('Roles table does not exist. Please run the initial migration first.');
            return;
        }

        // Check if roles already exist
        const rolesExist = await queryRunner.query('SELECT COUNT(*) as count FROM "roles"');
        
        if (parseInt(rolesExist[0].count) === 0) {
            console.log('Inserting default roles...');
            // Insert default roles
            await queryRunner.query(`
                INSERT INTO "roles" ("name", "code", "description") VALUES
                ('Admin', 'admin', 'System administrator with full access'),
                ('Manager', 'manager', 'Manager with limited administrative access'),
                ('User', 'user', 'Regular user with basic access'),
                ('Guest', 'guest', 'Guest user with read-only access')
                RETURNING id, name, code, description
            `);
            console.log('✓ Default roles inserted');
        } else {
            console.log('Roles already exist, skipping role creation');
        }

        // Check if admin user already exists
        const adminExists = await queryRunner.query(
            'SELECT COUNT(*) as count FROM "users" WHERE email = $1', 
            ['admin@example.com']
        );

        if (parseInt(adminExists[0].count) === 0) {
            console.log('Creating admin user...');
            // Get admin role ID
            const adminRole = await queryRunner.query(
                'SELECT id FROM "roles" WHERE code = $1', 
                ['admin']
            );

            if (!adminRole || adminRole.length === 0) {
                throw new Error('Admin role not found');
            }

            const adminRoleId = adminRole[0].id;
            const hashedPassword = await this.hashPassword('admin123');
            
            // Insert admin user
            await queryRunner.query(
                `INSERT INTO "users" 
                ("email", "password_hash", "first_name", "last_name", "role_id", "is_active") 
                VALUES ($1, $2, $3, $4, $5, $6)`,
                ['admin@example.com', hashedPassword, 'System', 'Administrator', adminRoleId, true]
            );
            console.log('✓ Admin user created');
        } else {
            console.log('Admin user already exists, skipping creation');
        }

        // Insert sample manager user
        const managerExists = await queryRunner.query(
            'SELECT COUNT(*) as count FROM "users" WHERE email = $1', 
            ['manager@example.com']
        );

        if (parseInt(managerExists[0].count) === 0) {
            console.log('Creating sample manager user...');
            const managerRole = await queryRunner.query(
                'SELECT id FROM "roles" WHERE code = $1', 
                ['manager']
            );

            if (managerRole && managerRole.length > 0) {
                const managerRoleId = managerRole[0].id;
                const hashedPassword = await this.hashPassword('manager123');
                
                await queryRunner.query(
                    `INSERT INTO "users" 
                    ("email", "password_hash", "first_name", "last_name", "role_id", "is_active") 
                    VALUES ($1, $2, $3, $4, $5, $6)`,
                    ['manager@example.com', hashedPassword, 'Project', 'Manager', managerRoleId, true]
                );
                console.log('✓ Sample manager user created');
            }
        }

        // Insert sample regular user
        const userExists = await queryRunner.query(
            'SELECT COUNT(*) as count FROM "users" WHERE email = $1', 
            ['user@example.com']
        );

        if (parseInt(userExists[0].count) === 0) {
            console.log('Creating sample regular user...');
            const userRole = await queryRunner.query(
                'SELECT id FROM "roles" WHERE code = $1', 
                ['user']
            );

            if (userRole && userRole.length > 0) {
                const userRoleId = userRole[0].id;
                const hashedPassword = await this.hashPassword('user123');
                
                await queryRunner.query(
                    `INSERT INTO "users" 
                    ("email", "password_hash", "first_name", "last_name", "role_id", "is_active") 
                    VALUES ($1, $2, $3, $4, $5, $6)`,
                    ['user@example.com', hashedPassword, 'Regular', 'User', userRoleId, true]
                );
                console.log('✓ Sample regular user created');
            }

        // Insert sample tasks if none exist
        const tasksExist = await queryRunner.query('SELECT COUNT(*) as count FROM "tasks"');
        
        if (parseInt(tasksExist[0].count) === 0) {
            console.log('Creating sample tasks...');
            // Get user IDs for task assignment
            const users = await queryRunner.query('SELECT id FROM "users" LIMIT 2');
            
            if (users && users.length > 0) {
                const userId1 = users[0].id;
                const userId2 = users.length > 1 ? users[1].id : users[0].id;
                
                // Insert sample tasks
                await queryRunner.query(`
                    INSERT INTO "tasks" 
                    ("title", "description", "status", "priority", "due_date", "user_id") 
                    VALUES 
                    ('Complete project setup', 'Set up the initial project structure and configurations', 'pending', 'high', NOW() + INTERVAL '7 days', $1),
                    ('Create database schema', 'Design and implement the initial database schema', 'in_progress', 'high', NOW() + INTERVAL '14 days', $1),
                    ('Implement authentication', 'Set up JWT authentication and user management', 'pending', 'medium', NOW() + INTERVAL '10 days', $2),
                    ('Write API documentation', 'Document all API endpoints with examples', 'pending', 'low', NOW() + INTERVAL '21 days', $2),
                    ('Set up CI/CD pipeline', 'Configure GitHub Actions for automated testing and deployment', 'pending', 'high', NOW() + INTERVAL '5 days', $1)
                `, [userId1, userId2]);
                
                console.log('✓ Sample tasks created');
            }
        } else {
            console.log('Tasks already exist, skipping task creation');
        }

        console.log('✓ Initial data migration completed successfully');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // We don't want to remove the default data in the down migration
        // as it might be referenced by other data
        console.log('Skipping data removal in down migration');
        
        // Start a transaction
        await queryRunner.startTransaction();
        
        try {
            // Delete sample users (except the first admin)
            console.log('Deleting sample users...');
            await queryRunner.query(
                `DELETE FROM "users" WHERE email IN ($1, $2)`,
                ['manager@example.com', 'user@example.com']
            );
            
            // Reset admin user
            console.log('Resetting admin user...');
            const adminRole = await queryRunner.query(
                'SELECT id FROM "roles" WHERE code = $1', 
                ['admin']
            );
            
            if (adminRole && adminRole.length > 0) {
                const adminRoleId = adminRole[0].id;
                const hashedPassword = await this.hashPassword('admin123');
                
                await queryRunner.query(
                    `UPDATE "users" 
                    SET 
                        first_name = $1,
                        last_name = $2,
                        password_hash = $3,
                        is_active = $4,
                        role_id = $5,
                        deleted_at = NULL
                    WHERE email = $6`,
                    [
                        'System',
                        'Administrator',
                        hashedPassword,
                        true,
                        adminRoleId,
                        'admin@example.com'
                    ]
                );
            }
            
            // Delete additional roles (keep only admin and user)
            console.log('Cleaning up roles...');
            await queryRunner.query(
                `DELETE FROM "roles" WHERE code NOT IN ($1, $2)`,
                ['admin', 'user']
            );
            
            await queryRunner.commitTransaction();
            console.log('=== Initial data reverted successfully ===');
        } catch (error) {
            console.error('Error during initial data reversion:', error);
            await queryRunner.rollbackTransaction();
            throw error;
        }
    }
}
