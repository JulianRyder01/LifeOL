import { User } from './user.entity';
export declare class UserConfig {
    id: string;
    userId: string;
    dontShowTaskCompleteConfirm: boolean;
    selectedTitles: string[];
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
