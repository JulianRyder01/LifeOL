-- Enable the uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS project_event_progress_logs CASCADE;
DROP TABLE IF EXISTS user_configs CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS attributes CASCADE;
DROP TABLE IF EXISTS project_events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create tables with integer primary keys (no UUIDs)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE attributes (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    attribute VARCHAR(255) NOT NULL,
    level INTEGER NOT NULL,
    exp INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES users(id)
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    timestamp TIMESTAMP NOT NULL,
    "expGains" JSONB NOT NULL,
    "relatedItemId" INTEGER,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES users(id)
);

CREATE TABLE project_events (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    progress REAL NOT NULL,
    "attributeRewards" JSONB,
    "itemRewards" JSONB,
    "completedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES users(id)
);

CREATE TABLE project_event_progress_logs (
    id SERIAL PRIMARY KEY,
    "projectEventId" INTEGER NOT NULL,
    change REAL NOT NULL,
    reason VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("projectEventId") REFERENCES project_events(id)
);

CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    effects JSONB,
    used BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES users(id)
);

CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(255) NOT NULL,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "unlockedAt" TIMESTAMP,
    "triggerType" VARCHAR(255),
    "triggerCondition" VARCHAR(255),
    progress INTEGER,
    target INTEGER,
    "isTitle" BOOLEAN,
    "attributeRequirement" VARCHAR(255),
    "levelRequirement" INTEGER,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES users(id)
);

CREATE TABLE user_configs (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "dontShowTaskCompleteConfirm" BOOLEAN NOT NULL DEFAULT false,
    "selectedTitles" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);