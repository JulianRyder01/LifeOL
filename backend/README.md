# LifeOL 后端服务

人生Online后端服务 - 云端数据存储

## 简介

这是 LifeOL 项目的后端服务，基于 NestJS 构建，提供 RESTful API 接口用于用户认证、数据存储等功能。

## 技术栈

- Node.js + NestJS
- TypeScript
- PostgreSQL
- JWT 认证
- TypeORM

## 环境配置

1. 复制 [.env.example](file:///d:/Desktop/Develop/LifeOL/backend/.env.example) 文件为 [.env](file:///d:/Desktop/Develop/LifeOL/backend/.env) 并配置相应参数：

```env
# 数据库配置
DB_HOST=8.155.18.113           # PostgreSQL服务器地址
DB_PORT=5432                   # PostgreSQL端口
DB_USERNAME=lifeol             # 数据库用户名
DB_PASSWORD=password           # 数据库密码
DB_NAME=lifeol                 # 数据库名

# JWT 配置
JWT_SECRET=lifeol_jwt_secret_key  # JWT密钥
JWT_EXPIRES_IN=3600s           # Access token过期时间
JWT_REFRESH_EXPIRES_IN=7d      # Refresh token过期时间

# 应用配置
PORT=3001                      # 应用监听端口
NODE_ENV=development           # 运行环境
```

2. 确保远程 PostgreSQL 服务器已正确配置并允许来自应用服务器的连接。

3. 在 PostgreSQL 服务器上执行 [init-db.sql](file:///d:/Desktop/Develop/LifeOL/backend/init-db.sql) 脚本创建数据库和用户：

```bash
psql -U postgres -f init-db.sql
```

## 数据库设置

确保您的 PostgreSQL 服务器已正确配置：

1. 创建数据库用户和数据库（使用 [init-db.sql](file:///d:/Desktop/Develop/LifeOL/backend/init-db.sql) 脚本）

2. 确保 PostgreSQL 配置文件 (postgresql.conf) 中的 `listen_addresses` 设置为 '*' 或服务器IP：
   ```
   listen_addresses = '*'          # 监听所有地址
   port = 5432                     # 端口
   ```

3. 在 pg_hba.conf 文件中添加适当的访问规则：
   ```
   # 允许来自特定IP的MD5加密连接
   host    lifeol    lifeol    120.235.113.236/32    md5
   
   # 或者允许来自任何IP的连接（仅用于测试环境，生产环境不推荐）
   host    lifeol    lifeol    0.0.0.0/0             md5
   ```
   
   根据错误信息，您的应用服务器IP是 `120.235.113.236`。

4. 重启 PostgreSQL 服务使配置生效：
   ```bash
   # Ubuntu/Debian
   sudo systemctl restart postgresql
   
   # CentOS/RHEL
   sudo systemctl restart postgresql
   
   # 或者使用
   sudo service postgresql restart
   ```

## Nginx 配置

如果您使用 Nginx 作为反向代理，可以参考 [nginx.conf](file:///d:/Desktop/Develop/LifeOL/nginx.conf) 文件中的配置示例：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为您的域名或服务器IP

    # 代理后端API请求
    location /api/ {
        proxy_pass http://localhost:3001/;  # 后端服务运行端口
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 代理Swagger文档
    location /api-docs/ {
        proxy_pass http://localhost:3001/api-docs/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 安装依赖

```bash
npm install
```

## 开发环境运行

```bash
npm run start:dev
```

## 生产环境构建

```bash
npm run build
```

## 生产环境运行

```bash
npm run start:prod
```

## API 文档

启动服务后，可以通过以下地址访问 Swagger API 文档：

```
http://localhost:3001/api-docs
```

## 数据库迁移

TypeORM 配置为自动同步模式（仅开发环境），在生产环境中应使用迁移：

```bash
# 生成迁移
npm run typeorm migration:generate -- -n MigrationName

# 运行迁移
npm run typeorm migration:run
```

## 故障排除

### 数据库连接问题

如果您遇到类似以下的错误：

```
error: no pg_hba.conf entry for host "120.235.113.236", user "lifeol", database "lifeol", no encryption
```

请确保：

1. 在 `pg_hba.conf` 文件中添加了正确的访问规则
2. PostgreSQL 服务已重启
3. 防火墙允许 5432 端口的连接
4. PostgreSQL 配置为监听外部连接

### 检查防火墙设置

确保服务器防火墙允许来自应用服务器的连接：

```bash
# Ubuntu/Debian ufw
sudo ufw allow from 120.235.113.236 to any port 5432

# 或者开放 5432 端口给所有IP（仅用于测试）
sudo ufw allow 5432

# CentOS/RHEL firewalld
sudo firewall-cmd --permanent --add-port=5432/tcp
sudo firewall-cmd --reload
```

### 测试数据库连接

您可以使用以下命令测试数据库连接：

```bash
# 使用 psql 测试连接
psql -h 8.155.18.113 -p 5432 -U lifeol -d lifeol

# 或使用 telnet 测试端口连通性
telnet 8.155.18.113 5432
```

## 概述

LifeOL 后端 API 为前端应用提供云端数据存储服务，替代原先基于 localStorage 的本地存储方案。API 使用 RESTful 设计风格，采用 JSON 格式进行数据交换。

## 技术栈

- **框架**: Node.js + NestJS (TypeScript)
- **数据库**: PostgreSQL
- **认证**: JWT (JSON Web Tokens)
- **API 文档**: Swagger/OpenAPI
- **ORM**: TypeORM

## 架构设计

```
graph TD
    A[前端应用] --> B[API 网关/Nginx]
    B --> C[NestJS 应用]
    C --> D[认证模块]
    C --> E[用户模块]
    C --> F[属性模块]
    C --> G[事件模块]
    C --> H[项目事件模块]
    C --> I[道具模块]
    C --> J[成就模块]
    C --> K[配置模块]
    C --> L[数据导入导出模块]
    
    D --> M[(PostgreSQL)]
    E --> M
    F --> M
    G --> M
    H --> M
    I --> M
    J --> M
    K --> M
    L --> M
```

## JWT 认证实现

### 依赖包

JWT 认证使用以下依赖包：
- `@nestjs/jwt`: NestJS 的 JWT 模块
- `@nestjs/passport`: NestJS 的 Passport 集成
- `passport-jwt`: Passport 的 JWT 策略
- `passport-local`: Passport 的本地策略（用于登录）

### 认证流程

```
sequenceDiagram
    participant C as 客户端
    participant A as 认证API
    participant DB as 数据库
    participant JWT as JWT服务

    C->>A: 1. 注册请求 (用户名, 邮箱, 密码)
    A->>DB: 检查用户是否存在
    DB-->>A: 用户不存在
    A->>DB: 创建新用户 (密码加密)
    DB-->>A: 用户创建成功
    A->>JWT: 生成JWT token
    JWT-->>A: 返回token
    A->>C: 返回用户信息和token

    C->>A: 2. 登录请求 (邮箱, 密码)
    A->>DB: 查找用户
    DB-->>A: 返回用户信息
    A->>A: 验证密码
    A->>JWT: 生成JWT token
    JWT-->>A: 返回token
    A->>C: 返回用户信息和token

    C->>A: 3. 受保护API请求 (携带token)
    A->>JWT: 验证token
    JWT-->>A: token有效
    A->>DB: 执行业务逻辑
    DB-->>A: 返回数据
    A->>C: 返回请求数据
```

### Token 结构

JWT token 包含三部分：
1. **Header**: 包含算法和 token 类型
2. **Payload**: 包含用户信息和声明
3. **Signature**: 用于验证 token 完整性

示例 payload:
```
{
  "sub": "用户ID",
  "username": "用户名",
  "email": "用户邮箱",
  "iat": 1516239022,
  "exp": 1516242622
}
~~~

### 前端使用
在前端，我们创建了 apiClient.ts 工具来处理JWT认证：

登录或注册后，将token存储在localStorage中

在后续请求的Authorization头中添加Bearer token

token过期时，使用refresh token获取新token

~~~typescript
// 设置token
setToken(token: string): void {
  this.token = token;
  localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
}

// 在请求中添加认证头
if (this.token) {
  config.headers = {
    ...config.headers,
    'Authorization': `Bearer ${this.token}`,
  };
}
~~~
## API 端点

### 认证相关

#### 用户注册
```
POST /api/auth/register
```

**请求体:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**响应:**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "createdAt": "string"
  },
  "token": "string"
}
```

#### 用户登录
```
POST /api/auth/login
```

**请求体:**
```json
{
  "email": "string",
  "password": "string"
}
```

**响应:**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "createdAt": "string"
  },
  "token": "string"
}
```

#### 刷新令牌
```
POST /api/auth/refresh
```

**请求头:**
```
Authorization: Bearer <refresh_token>
```

**响应:**
```json
{
  "token": "string",
  "refreshToken": "string"
}
```

### 用户数据相关

#### 获取用户信息
```
GET /api/users/me
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**响应:**
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "avatar": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### 更新用户信息
```
PUT /api/users/me
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**请求体:**
```json
{
  "username": "string",
  "avatar": "string"
}
```

**响应:**
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "avatar": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### 属性相关

#### 获取用户属性
```
GET /api/attributes
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**响应:**
```json
{
  "int": { "level": 1, "exp": 0 },
  "str": { "level": 1, "exp": 0 },
  "vit": { "level": 1, "exp": 0 },
  "cha": { "level": 1, "exp": 0 },
  "eq": { "level": 1, "exp": 0 },
  "cre": { "level": 1, "exp": 0 }
}
```

#### 更新用户属性
```
PUT /api/attributes
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**请求体:**
```json
{
  "int": { "level": 1, "exp": 0 },
  "str": { "level": 1, "exp": 0 },
  "vit": { "level": 1, "exp": 0 },
  "cha": { "level": 1, "exp": 0 },
  "eq": { "level": 1, "exp": 0 },
  "cre": { "level": 1, "exp": 0 }
}
```

**响应:**
```json
{
  "int": { "level": 1, "exp": 0 },
  "str": { "level": 1, "exp": 0 },
  "vit": { "level": 1, "exp": 0 },
  "cha": { "level": 1, "exp": 0 },
  "eq": { "level": 1, "exp": 0 },
  "cre": { "level": 1, "exp": 0 }
}
```

### 事件相关

#### 获取用户事件列表
```
GET /api/events
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**查询参数:**
- `limit` (可选): 限制返回数量
- `offset` (可选): 偏移量
- `sortBy` (可选): 排序字段 (默认: createdAt)
- `order` (可选): 排序顺序 (默认: DESC)

**响应:**
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "timestamp": "string",
    "expGains": { "int": 0, "str": 0 },
    "relatedItemId": "string",
    "userId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

#### 创建事件
```
POST /api/events
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**请求体:**
```json
{
  "title": "string",
  "description": "string",
  "timestamp": "string",
  "expGains": { "int": 0, "str": 0 },
  "relatedItemId": "string"
}
```

**响应:**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "timestamp": "string",
  "expGains": { "int": 0, "str": 0 },
  "relatedItemId": "string",
  "userId": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### 更新事件
```
PUT /api/events/{id}
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**请求体:**
```json
{
  "title": "string",
  "description": "string",
  "timestamp": "string",
  "expGains": { "int": 0, "str": 0 },
  "relatedItemId": "string"
}
```

**响应:**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "timestamp": "string",
  "expGains": { "int": 0, "str": 0 },
  "relatedItemId": "string",
  "userId": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### 删除事件
```
DELETE /api/events/{id}
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**响应:**
```json
{
  "message": "Event deleted successfully"
}
```

### 项目事件相关

#### 获取用户项目事件列表
```
GET /api/project-events
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**查询参数:**
- `limit` (可选): 限制返回数量
- `offset` (可选): 偏移量
- `status` (可选): 状态筛选 (all/active/completed)
- `sortBy` (可选): 排序字段 (默认: createdAt)
- `order` (可选): 排序顺序 (默认: DESC)

**响应:**
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "progress": 0,
    "attributeRewards": { "int": 0, "str": 0 },
    "itemRewards": ["string"],
    "createdAt": "string",
    "completedAt": "string",
    "progressLog": [
      {
        "change": 0,
        "reason": "string",
        "timestamp": "string"
      }
    ],
    "userId": "string",
    "updatedAt": "string"
  }
]
```

#### 创建项目事件
```
POST /api/project-events
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**请求体:**
```json
{
  "title": "string",
  "description": "string",
  "attributeRewards": { "int": 0, "str": 0 },
  "itemRewards": ["string"]
}
```

**响应:**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "progress": 0,
  "attributeRewards": { "int": 0, "str": 0 },
  "itemRewards": ["string"],
  "createdAt": "string",
  "completedAt": "string",
  "progressLog": [],
  "userId": "string",
  "updatedAt": "string"
}
```

#### 更新项目事件
```
PUT /api/project-events/{id}
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**请求体:**
```json
{
  "title": "string",
  "description": "string",
  "progress": 0,
  "attributeRewards": { "int": 0, "str": 0 },
  "itemRewards": ["string"]
}
```

**响应:**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "progress": 0,
  "attributeRewards": { "int": 0, "str": 0 },
  "itemRewards": ["string"],
  "createdAt": "string",
  "completedAt": "string",
  "progressLog": [],
  "userId": "string",
  "updatedAt": "string"
}
```

#### 更新项目事件进度
```
PATCH /api/project-events/{id}/progress
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**请求体:**
```json
{
  "change": 0,
  "reason": "string"
}
```

**响应:**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "progress": 0,
  "attributeRewards": { "int": 0, "str": 0 },
  "itemRewards": ["string"],
  "createdAt": "string",
  "completedAt": "string",
  "progressLog": [
    {
      "change": 0,
      "reason": "string",
      "timestamp": "string"
    }
  ],
  "userId": "string",
  "updatedAt": "string"
}
```

#### 删除项目事件
```
DELETE /api/project-events/{id}
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**响应:**
```json
{
  "message": "Project event deleted successfully"
}
```

### 道具相关

#### 获取用户道具列表
```
GET /api/items
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**查询参数:**
- `type` (可选): 道具类型筛选 (equipment/consumable/trophy)
- `limit` (可选): 限制返回数量
- `offset` (可选): 偏移量

**响应:**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "icon": "string",
    "type": "equipment|consumable|trophy",
    "effects": [
      {
        "attribute": "int",
        "type": "fixed|percentage",
        "value": 0
      }
    ],
    "createdAt": "string",
    "used": false,
    "usedAt": "string",
    "userId": "string",
    "updatedAt": "string"
  }
]
```

#### 创建道具
```
POST /api/items
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**请求体:**
```json
{
  "name": "string",
  "description": "string",
  "icon": "string",
  "type": "equipment|consumable|trophy",
  "effects": [
    {
      "attribute": "int",
      "type": "fixed|percentage",
      "value": 0
    }
  ]
}
```

**响应:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "icon": "string",
  "type": "equipment|consumable|trophy",
  "effects": [
    {
      "attribute": "int",
      "type": "fixed|percentage",
      "value": 0
    }
  ],
  "createdAt": "string",
  "used": false,
  "usedAt": "string",
  "userId": "string",
  "updatedAt": "string"
}
```

#### 更新道具
```
PUT /api/items/{id}
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**请求体:**
```json
{
  "name": "string",
  "description": "string",
  "icon": "string",
  "type": "equipment|consumable|trophy",
  "effects": [
    {
      "attribute": "int",
      "type": "fixed|percentage",
      "value": 0
    }
  ]
}
```

**响应:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "icon": "string",
  "type": "equipment|consumable|trophy",
  "effects": [
    {
      "attribute": "int",
      "type": "fixed|percentage",
      "value": 0
    }
  ],
  "createdAt": "string",
  "used": false,
  "usedAt": "string",
  "userId": "string",
  "updatedAt": "string"
}
```

#### 使用道具
```
POST /api/items/{id}/use
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**响应:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "icon": "string",
  "type": "equipment|consumable|trophy",
  "effects": [
    {
      "attribute": "int",
      "type": "fixed|percentage",
      "value": 0
    }
  ],
  "createdAt": "string",
  "used": true,
  "usedAt": "string",
  "userId": "string",
  "updatedAt": "string"
}
```

#### 删除道具
```
DELETE /api/items/{id}
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**响应:**
```json
{
  "message": "Item deleted successfully"
}
```

### 成就相关

#### 获取用户成就列表
```
GET /api/achievements
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**查询参数:**
- `status` (可选): 状态筛选 (all/unlocked/locked)
- `type` (可选): 类型筛选 (system/custom/title)

**响应:**
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "icon": "string",
    "isCustom": false,
    "unlockedAt": "string",
    "triggerType": "string",
    "triggerCondition": "string",
    "isTitle": false,
    "attributeRequirement": "int",
    "levelRequirement": 0,
    "userId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

#### 创建自定义成就
```
POST /api/achievements
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**请求体:**
```json
{
  "title": "string",
  "description": "string",
  "icon": "string",
  "triggerType": "string",
  "triggerCondition": "string"
}
```

**响应:**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "icon": "string",
  "isCustom": true,
  "unlockedAt": null,
  "triggerType": "string",
  "triggerCondition": "string",
  "isTitle": false,
  "attributeRequirement": null,
  "levelRequirement": null,
  "userId": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### 更新成就状态（解锁成就）
```
PATCH /api/achievements/{id}/unlock
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**响应:**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "icon": "string",
  "isCustom": false,
  "unlockedAt": "string",
  "triggerType": "string",
  "triggerCondition": "string",
  "isTitle": false,
  "attributeRequirement": "int",
  "levelRequirement": 0,
  "userId": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### 删除自定义成就
```
DELETE /api/achievements/{id}
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**响应:**
```json
{
  "message": "Achievement deleted successfully"
}
```

### 配置相关

#### 获取用户配置
```
GET /api/config
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**响应:**
```json
{
  "id": "string",
  "dontShowTaskCompleteConfirm": false,
  "selectedTitles": ["string"],
  "userId": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### 更新用户配置
```
PUT /api/config
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**请求体:**
```json
{
  "dontShowTaskCompleteConfirm": false,
  "selectedTitles": ["string"]
}
```

**响应:**
```json
{
  "id": "string",
  "dontShowTaskCompleteConfirm": false,
  "selectedTitles": ["string"],
  "userId": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### 数据导入导出相关

#### 导出用户所有数据
```
GET /api/data/export
```

**请求头:**
```
Authorization: Bearer <access_token>
```

**响应:**
```json
{
  "version": "1.0.0",
  "exportDate": "string",
  "attributes": {
    "int": { "level": 1, "exp": 0 },
    "str": { "level": 1, "exp": 0 },
    "vit": { "level": 1, "exp": 0 },
    "cha": { "level": 1, "exp": 0 },
    "eq": { "level": 1, "exp": 0 },
    "cre": { "level": 1, "exp": 0 }
  },
  "events": [],
  "achievements": [],
  "items": [],
  "projectEvents": [],
  "selectedTitles": [],
  "userConfig": {
    "username": "string",
    "avatar": "string"
  }
}
```

#### 导入用户数据
```
POST /api/data/import
```

**请求头:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**请求体:**
```
file: (JSON文件)
```

**响应:**
```json
{
  "message": "Data imported successfully"
}
```

## 错误响应格式

所有错误响应都遵循以下格式:

```json
{
  "statusCode": 400,
  "message": "错误描述",
  "error": "Bad Request"
}
```

常见的错误状态码:
- 400: 请求参数错误
- 401: 未授权访问
- 403: 禁止访问
- 404: 资源未找到
- 500: 服务器内部错误

## 认证机制

所有需要用户身份的 API 端点都需要在请求头中包含有效的 JWT token:

```
Authorization: Bearer <access_token>
```

## 数据模型关系图

```
erDiagram
    USER ||--o{ ATTRIBUTE : has
    USER ||--o{ EVENT : creates
    USER ||--o{ PROJECT_EVENT : creates
    USER ||--o{ ITEM : owns
    USER ||--o{ ACHIEVEMENT : unlocks
    USER ||--|| USER_CONFIG : has
    PROJECT_EVENT ||--o{ PROJECT_EVENT_PROGRESS_LOG : has
    ITEM ||--o{ ITEM_EFFECT : has

    USER {
        string id PK
        string username
        string email
        string password
        string avatar
        datetime createdAt
        datetime updatedAt
    }

    ATTRIBUTE {
        string id PK
        string userId FK
        string attribute "int,str,vit,cha,eq,cre"
        int level
        int exp
        datetime createdAt
        datetime updatedAt
    }

    EVENT {
        string id PK
        string userId FK
        string title
        string description
        datetime timestamp
        json expGains
        string relatedItemId
        datetime createdAt
        datetime updatedAt
    }

    PROJECT_EVENT {
        string id PK
        string userId FK
        string title
        string description
        float progress
        json attributeRewards
        json itemRewards
        datetime createdAt
        datetime completedAt
        datetime updatedAt
    }

    PROJECT_EVENT_PROGRESS_LOG {
        string id PK
        string projectEventId FK
        float change
        string reason
        datetime timestamp
    }

    ITEM {
        string id PK
        string userId FK
        string name
        string description
        string icon
        string type "equipment,consumable,trophy"
        boolean used
        datetime usedAt
        datetime createdAt
        datetime updatedAt
    }

    ITEM_EFFECT {
        string id PK
        string itemId FK
        string attribute
        string type "fixed,percentage"
        float value
    }

    ACHIEVEMENT {
        string id PK
        string userId FK
        string title
        string description
        string icon
        boolean isCustom
        datetime unlockedAt
        string triggerType
        string triggerCondition
        boolean isTitle
        string attributeRequirement
        int levelRequirement
        datetime createdAt
        datetime updatedAt
    }

    USER_CONFIG {
        string id PK
        string userId FK
        boolean dontShowTaskCompleteConfirm
        json selectedTitles
        datetime createdAt
        datetime updatedAt
    }
```

## 部署说明

### 环境变量

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=lifeol
DB_PASSWORD=password
DB_NAME=lifeol

# JWT 配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=3600s
JWT_REFRESH_EXPIRES_IN=7d

# 应用配置
PORT=3001
NODE_ENV=production
```

### 启动命令

```bash
# 安装依赖
npm install

# 运行数据库迁移
npm run migration:run

# 启动开发服务器
npm run start:dev

# 启动生产服务器
npm run start:prod
```

## API 版本控制

当前 API 版本: v1

所有 API 端点都以 `/api/v1/` 为前缀，例如:
```
POST /api/v1/auth/register
GET /api/v1/users/me
```