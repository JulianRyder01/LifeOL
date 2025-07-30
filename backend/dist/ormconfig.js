"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const attribute_entity_1 = require("./entities/attribute.entity");
const event_entity_1 = require("./entities/event.entity");
const project_event_entity_1 = require("./entities/project-event.entity");
const project_event_progress_log_entity_1 = require("./entities/project-event-progress-log.entity");
const item_entity_1 = require("./entities/item.entity");
const achievement_entity_1 = require("./entities/achievement.entity");
const user_config_entity_1 = require("./entities/user-config.entity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'lifeol',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'lifeol',
    synchronize: process.env.NODE_ENV !== 'production',
    logging: false,
    entities: [
        user_entity_1.User,
        attribute_entity_1.Attribute,
        event_entity_1.Event,
        project_event_entity_1.ProjectEvent,
        project_event_progress_log_entity_1.ProjectEventProgressLog,
        item_entity_1.Item,
        achievement_entity_1.Achievement,
        user_config_entity_1.UserConfig
    ],
    migrations: [],
    subscribers: [],
});
//# sourceMappingURL=ormconfig.js.map