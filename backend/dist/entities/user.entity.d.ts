import { Attribute } from './attribute.entity';
import { Event } from './event.entity';
import { ProjectEvent } from './project-event.entity';
import { Item } from './item.entity';
import { Achievement } from './achievement.entity';
import { UserConfig } from './user-config.entity';
export declare class User {
    id: string;
    email: string;
    username: string;
    password: string;
    avatar: string;
    createdAt: Date;
    updatedAt: Date;
    attributes: Attribute[];
    events: Event[];
    projectEvents: ProjectEvent[];
    items: Item[];
    achievements: Achievement[];
    userConfigs: UserConfig[];
}
