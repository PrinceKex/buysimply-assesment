"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialData1690791533535 = void 0;
class InitialData1690791533535 {
    constructor() {
        this.name = 'InitialData1690791533535';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            INSERT INTO "roles" ("name", "code", "description") VALUES
            ('Admin', 'admin', 'System administrator'),
            ('User', 'user', 'Regular user')
        `);
        await queryRunner.query(`
            INSERT INTO "users" ("email", "password_hash", "first_name", "last_name", "role_id", "is_active")
            VALUES (
                'admin@example.com',
                '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
                'Admin',
                'User',
                (SELECT id FROM roles WHERE code = 'admin'),
                true
            )
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DELETE FROM "users" WHERE email = 'admin@example.com'`);
        await queryRunner.query(`DELETE FROM "roles" WHERE code IN ('admin', 'user')`);
    }
}
exports.InitialData1690791533535 = InitialData1690791533535;
//# sourceMappingURL=1690791533535-InitialData.js.map