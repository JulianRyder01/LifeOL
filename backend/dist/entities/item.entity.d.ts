import { User } from './user.entity';
export declare class Item {
    id: string;
    userId: string;
    name: string;
    description: string;
    icon: string;
    type: 'equipment' | 'consumable' | 'trophy';
    effects: Array<{
        attribute: string;
        type: 'fixed' | 'percentage';
        value: number;
    }>;
    used: boolean;
    usedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
