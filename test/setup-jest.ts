import { DataSource } from 'typeorm';

let dataSource: DataSource;

beforeAll(async () => {
  // Wait for database to be ready
  await new Promise(resolve => setTimeout(resolve, 5000)); // Give database time to start
  
  dataSource = new DataSource({
    type: 'postgres',
    host: '172.20.0.2', // Docker network IP address for postgres container
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
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
});

// Add a health check before tests
beforeEach(async () => {
  try {
    await dataSource.query('SELECT 1');
  } catch (error) {
    console.error('Database health check failed:', error);
    throw error;
  }
});

// Export the dataSource for use in test files
afterAll(async () => {
  if (dataSource) {
    await dataSource.destroy();
  }
});

// Export the dataSource for use in test files
export { dataSource };

