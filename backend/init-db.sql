-- 在PostgreSQL服务器上执行此脚本以创建数据库和用户
-- 使用方法: psql -U postgres -f init-db.sql

-- 创建数据库用户
CREATE USER lifeol WITH PASSWORD 'password';

-- 创建数据库
CREATE DATABASE lifeol OWNER lifeol;

-- 授予所有权限
GRANT ALL PRIVILEGES ON DATABASE lifeol TO lifeol;

-- 连接到新创建的数据库
\c lifeol

-- 为用户授予创建表的权限
GRANT CREATE ON SCHEMA public TO lifeol;

-- 注意：除了运行此脚本，您还需要配置 PostgreSQL 的配置文件
-- 请参考 backend/README.md 中的说明来完成完整的 PostgreSQL 配置