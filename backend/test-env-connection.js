require('dotenv').config();
const { typeOrmConfig } = require('./dist/config/typeorm.config');

console.log('环境变量检查:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USERNAME:', process.env.DB_USERNAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '已设置' : '未设置');
console.log('DB_NAME:', process.env.DB_NAME);

console.log('\n尝试连接数据库...');

// 先构建项目
const { execSync } = require('child_process');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('构建完成');
} catch (error) {
  console.log('构建失败:', error.message);
}

// 测试数据库连接
async function testConnection() {
  // 动态导入编译后的模块
  try {
    const { DataSource } = require('typeorm');
    const { typeOrmConfig } = require('./dist/config/typeorm.config');
    
    console.log('\nTypeORM 配置:');
    console.log('Host:', typeOrmConfig.host);
    console.log('Port:', typeOrmConfig.port);
    console.log('Username:', typeOrmConfig.username);
    console.log('Password:', typeOrmConfig.password ? '已设置' : '未设置');
    console.log('Database:', typeOrmConfig.database);
    
    const dataSource = new DataSource({
      type: 'postgres',
      host: typeOrmConfig.host,
      port: typeOrmConfig.port,
      username: typeOrmConfig.username,
      password: typeOrmConfig.password,
      database: typeOrmConfig.database,
      entities: typeOrmConfig.entities,
      synchronize: false,
      logging: false,
    });

    await dataSource.initialize();
    console.log('✅ 数据库连接成功!');
    await dataSource.destroy();
  } catch (error) {
    console.log('❌ 数据库连接失败:', error.message);
    console.log('错误详情:', error);
  }
}

testConnection();