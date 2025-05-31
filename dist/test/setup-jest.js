"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSource = void 0;
const typeorm_1 = require("typeorm");
let dataSource;
beforeAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 5000));
    exports.dataSource = dataSource = new typeorm_1.DataSource({
        type: 'postgres',
        host: '172.20.0.2',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'buysimply',
        entities: [__dirname + '/../src/**/entities/*.entity{.ts,.js}'],
        synchronize: true,
        dropSchema: true,
        logging: true
    });
    try {
        await dataSource.initialize();
        await dataSource.synchronize();
        console.log('Database connected successfully');
    }
    catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
});
beforeEach(async () => {
    try {
        await dataSource.query('SELECT 1');
    }
    catch (error) {
        console.error('Database health check failed:', error);
        throw error;
    }
});
afterAll(async () => {
    if (dataSource) {
        await dataSource.destroy();
    }
});
//# sourceMappingURL=setup-jest.js.map