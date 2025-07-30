import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Attribute } from '../entities/attribute.entity';
import { Event } from '../entities/event.entity';
import { ProjectEvent } from '../entities/project-event.entity';
import { ProjectEventProgressLog } from '../entities/project-event-progress-log.entity';
import { Item } from '../entities/item.entity';
import { Achievement } from '../entities/achievement.entity';
import { UserConfig } from '../entities/user-config.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'lifeol',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'lifeol',
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
  synchronize: process.env.NODE_ENV !== 'production', // 仅在非生产环境使用
  logging: false,
};