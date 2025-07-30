import { User } from './user.entity';
export declare class Attribute {
    id: string;
    userId: string;
    attribute: string;
    level: number;
    exp: number;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
