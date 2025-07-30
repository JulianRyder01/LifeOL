import { typeOrmConfig } from './src/config/typeorm.config';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

console.log('环境变量检查:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USERNAME:', process.env.DB_USERNAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '已设置' : '未设置');
console.log('DB_NAME:', process.env.DB_NAME);

console.log('\nTypeORM 配置:');
console.log('Host:', typeOrmConfig.host);
console.log('Port:', typeOrmConfig.port);
console.log('Username:', typeOrmConfig.username);
console.log('Password:', typeOrmConfig.password ? '已设置' : '未设置');
console.log('Database:', typeOrmConfig.database);

// 测试数据库连接
async function testConnection() {
  console.log('\n尝试连接数据库...');
  
  const testConfig: any = { ...typeOrmConfig };
  
  const dataSource = new DataSource({
    type: 'postgres',
    host: testConfig.host,
    port: testConfig.port,
    username: testConfig.username,
    password: testConfig.password,
    database: testConfig.database,
    entities: testConfig.entities,
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ 数据库连接成功!');
    await dataSource.destroy();
  } catch (error) {
    console.log('❌ 数据库连接失败:', error.message);
  }
}

testConnection();