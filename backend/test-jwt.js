// JWT认证测试脚本
const jwt = require('jsonwebtoken');

// 从环境变量获取密钥或使用默认值
const JWT_SECRET = process.env.JWT_SECRET || 'lifeol_jwt_secret_key';

console.log('JWT认证测试');
console.log('====================');

// 1. 创建一个测试payload
const payload = {
  sub: 'test-user-id',
  username: 'testuser',
  email: 'test@example.com'
};

console.log('1. 创建测试payload:');
console.log(JSON.stringify(payload, null, 2));

// 2. 生成JWT token
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
console.log('\n2. 生成的JWT token:');
console.log(token);

// 3. 验证JWT token
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('\n3. 验证后的payload:');
  console.log(JSON.stringify(decoded, null, 2));
  console.log('\n✓ JWT认证测试通过');
} catch (error) {
  console.error('\n✗ JWT认证测试失败:', error.message);
}