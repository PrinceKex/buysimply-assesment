import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class InitialData1690791533535 implements MigrationInterface {
    name = 'InitialData1690791533535';

    private async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Start transaction
        const newQueryRunner = queryRunner.connection.createQueryRunner();
        await newQueryRunner.connect();
        await newQueryRunner.startTransaction();

        try {
            console.log('=== Starting initial data migration ===');
            
            // Check if roles already exist
            const rolesExist = await newQueryRunner.query('SELECT COUNT(*) as count FROM "roles"');
            
            if (parseInt(rolesExist[0].count) === 0) {
                console.log('Inserting default roles...');
                // Insert default roles
                await newQueryRunner.query(`
                    INSERT INTO "roles" ("name", "code", "description") VALUES
                    ('Admin', 'admin', 'System administrator with full access'),
                    ('Manager', 'manager', 'Manager with limited administrative access'),
                    ('User', 'user', 'Regular user with basic access'),
                    ('Guest', 'guest', 'Guest user with read-only access')
                `);
                console.log('✓ Default roles inserted');
            } else {
                console.log('Roles already exist, skipping role creation');
            }

            // Check if admin user already exists
            const adminExists = await newQueryRunner.query(
                'SELECT COUNT(*) as count FROM "users" WHERE email = $1', 
                ['admin@example.com']
            );

            if (parseInt(adminExists[0].count) === 0) {
                console.log('Creating admin user...');
                // Get admin role ID
                const adminRole = await newQueryRunner.query(
                    'SELECT id FROM "roles" WHERE code = $1', 
                    ['admin']
                );

                if (!adminRole || adminRole.length === 0) {
                    throw new Error('Admin role not found');
                }

                const adminRoleId = adminRole[0].id;
                const hashedPassword = await this.hashPassword('admin123');
                
                // Insert admin user
                await newQueryRunner.query(
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
            const managerExists = await newQueryRunner.query(
                'SELECT COUNT(*) as count FROM "users" WHERE email = $1', 
                ['manager@example.com']
            );

            if (parseInt(managerExists[0].count) === 0) {
                console.log('Creating sample manager user...');
                const managerRole = await newQueryRunner.query(
                    'SELECT id FROM "roles" WHERE code = $1', 
                    ['manager']
                );

                if (managerRole && managerRole.length > 0) {
                    const managerRoleId = managerRole[0].id;
                    const hashedPassword = await this.hashPassword('manager123');
                    
                    await newQueryRunner.query(
                        `INSERT INTO "users" 
                        ("email", "password_hash", "first_name", "last_name", "role_id", "is_active") 
                        VALUES ($1, $2, $3, $4, $5, $6)`,
                        ['manager@example.com', hashedPassword, 'Project', 'Manager', managerRoleId, true]
                    );
                    console.log('✓ Sample manager user created');
                }
            }

            // Insert sample regular user
            const userExists = await newQueryRunner.query(
                'SELECT COUNT(*) as count FROM "users" WHERE email = $1', 
                ['user@example.com']
            );

            if (parseInt(userExists[0].count) === 0) {
                console.log('Creating sample regular user...');
                const userRole = await newQueryRunner.query(
                    'SELECT id FROM "roles" WHERE code = $1', 
                    ['user']
                );

                if (userRole && userRole.length > 0) {
                    const userRoleId = userRole[0].id;
                    const hashedPassword = await this.hashPassword('user123');
                    
                    await newQueryRunner.query(
                        `INSERT INTO "users" 
                        ("email", "password_hash", "first_name", "last_name", "role_id", "is_active") 
                        VALUES ($1, $2, $3, $4, $5, $6)`,
                        ['user@example.com', hashedPassword, 'Regular', 'User', userRoleId, true]
                    );
                    console.log('✓ Sample regular user created');
                }
            }

            // Insert sample tasks if none exist
            const tasksExist = await newQueryRunner.query('SELECT COUNT(*) as count FROM "tasks"');
            
            if (parseInt(tasksExist[0].count) === 0) {
                console.log('Creating sample tasks...');
                // Get user IDs for task assignment
                const users = await newQueryRunner.query('SELECT id FROM "users" LIMIT 2');
                
                if (users && users.length > 0) {
                    const userId1 = users[0].id;
                    const userId2 = users.length > 1 ? users[1].id : users[0].id;
                    
                    // Insert sample tasks
                    await newQueryRunner.query(`
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

            // Commit transaction
            await newQueryRunner.commitTransaction();
            console.log('=== Initial data migration completed successfully ===');
        } catch (error) {
            console.error('Error during initial data migration:', error);
            // Rollback transaction if there's an error
            await newQueryRunner.rollbackTransaction();
            throw error;
        } finally {
            // Release the query runner
            await newQueryRunner.release();
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const newQueryRunner = queryRunner.connection.createQueryRunner();
        await newQueryRunner.connect();
        await newQueryRunner.startTransaction();

        try {
            console.log('=== Reverting initial data migration ===');
            
            // Delete sample tasks
            console.log('Deleting sample tasks...');
            await newQueryRunner.query(`DELETE FROM "tasks"`);
            
            // Delete sample users (except the first admin)
            console.log('Deleting sample users...');
            await newQueryRunner.query(`
                DELETE FROM "users" 
                WHERE email IN ('manager@example.com', 'user@example.com')
            `);
            
            // Reset admin user
            console.log('Resetting admin user...');
            const adminRole = await newQueryRunner.query(
                'SELECT id FROM "roles" WHERE code = $1', 
                ['admin']
            );
            
            if (adminRole && adminRole.length > 0) {
                const adminRoleId = adminRole[0].id;
                const hashedPassword = await this.hashPassword('admin123');
                
                await newQueryRunner.query(`
                    UPDATE "users" 
                    SET 
                        first_name = 'System',
                        last_name = 'Administrator',
                        password_hash = $1,
                        is_active = true,
                        role_id = $2,
                        deleted_at = NULL
                    WHERE email = 'admin@example.com'
                `, [hashedPassword, adminRoleId]);
            }
            
            // Delete additional roles (keep only admin and user)
            console.log('Cleaning up roles...');
            await newQueryRunner.query(`
                DELETE FROM "roles" 
                WHERE code NOT IN ('admin', 'user')
            `);
            
            await newQueryRunner.commitTransaction();
            console.log('=== Initial data reverted successfully ===');
        } catch (error) {
            console.error('Error during initial data reversion:', error);
            await newQueryRunner.rollbackTransaction();
            throw error;
        } finally {
            await newQueryRunner.release();
        }
    }
}
