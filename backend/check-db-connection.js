/**
 * 数据库连接检查脚本
 * 用于诊断PostgreSQL连接问题
 */

const { Client } = require('pg');
require('dotenv').config({ path: './.env' });

async function checkDatabaseConnection() {
  console.log('检查数据库连接...');
  
  // 从环境变量获取数据库配置
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USERNAME || 'lifeol',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'lifeol',
  };

  console.log('数据库配置:');
  console.log(`  主机: ${dbConfig.host}`);
  console.log(`  端口: ${dbConfig.port}`);
  console.log(`  用户: ${dbConfig.user}`);
  console.log(`  数据库: ${dbConfig.database}`);
  console.log('');

  const client = new Client(dbConfig);

  try {
    console.log('正在连接到数据库...');
    await client.connect();
    console.log('✅ 成功连接到数据库!');
    
    // 执行简单查询
    const result = await client.query('SELECT version()');
    console.log('\nPostgreSQL 版本信息:');
    console.log(result.rows[0].version);
    
    // 检查当前用户权限
    const userResult = await client.query('SELECT current_user, current_database()');
    console.log('\n当前连接信息:');
    console.log(`  用户: ${userResult.rows[0].current_user}`);
    console.log(`  数据库: ${userResult.rows[0].current_database}`);
    
  } catch (err) {
    console.log('❌ 数据库连接失败!');
    console.log('错误信息:');
    console.log(err.message);
    
    if (err.message.includes('no pg_hba.conf entry')) {
      console.log('\n🔧 解决方案:');
      console.log('1. 在PostgreSQL服务器的 pg_hba.conf 文件中添加以下行:');
      console.log(`   host    ${dbConfig.database}    ${dbConfig.user}    ${getPublicIP()}/32    md5`);
      console.log('2. 重启PostgreSQL服务');
      console.log('3. 确保防火墙允许连接到端口 5432');
    } else if (err.message.includes('Connection refused')) {
      console.log('\n🔧 解决方案:');
      console.log('1. 确保PostgreSQL服务正在运行');
      console.log('2. 检查postgresql.conf中的 listen_addresses 设置');
      console.log('3. 确保防火墙允许连接到端口 5432');
    } else if (err.message.includes('password authentication failed')) {
      console.log('\n🔧 解决方案:');
      console.log('1. 检查 .env 文件中的数据库密码是否正确');
      console.log('2. 确保在PostgreSQL中正确设置了用户密码');
      console.log('3. 如果需要，可以使用以下SQL命令重置密码:');
      console.log(`   ALTER USER ${dbConfig.user} WITH PASSWORD '${dbConfig.password}';`);
    }
  } finally {
    await client.end();
    console.log('\n数据库连接检查完成。');
  }
}

// 获取本机公网IP的简单方法
function getPublicIP() {
  // 这里返回错误信息中显示的IP地址
  // 在实际使用中，您可能需要使用其他方法获取公网IP
  return '120.235.113.236'; // 根据您的错误信息
}

// 运行检查
checkDatabaseConnection();