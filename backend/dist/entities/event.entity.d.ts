import { User } from './user.entity';
export declare class Event {
    id: string;
    userId: string;
    title: string;
    description: string;
    timestamp: Date;
    expGains: Record<string, number>;
    relatedItemId: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
