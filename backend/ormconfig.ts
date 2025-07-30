import { DataSource } from 'typeorm';
import { User } from './src/entities/user.entity';
import { Attribute } from './src/entities/attribute.entity';
import { Event } from './src/entities/event.entity';
import { ProjectEvent } from './src/entities/project-event.entity';
import { ProjectEventProgressLog } from './src/entities/project-event-progress-log.entity';
import { Item } from './src/entities/item.entity';
import { Achievement } from './src/entities/achievement.entity';
import { UserConfig } from './src/entities/user-config.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'lifeol',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'lifeol',
  synchronize: process.env.NODE_ENV !== 'production', // 仅在非生产环境使用
  logging: false,
  entities: [
    User,
    Attribute,
    Event,
    ProjectEvent,
    ProjectEventProgressLog,
    Item,
    Achievement,
    UserConfig
  ],
  migrations: [],
  subscribers: [],
});