import { User } from './user.entity';
export declare class Achievement {
    id: string;
    userId: string;
    title: string;
    description: string;
    icon: string;
    isCustom: boolean;
    unlockedAt: Date;
    triggerType: string;
    triggerCondition: string;
    progress: number;
    target: number;
    isTitle: boolean;
    attributeRequirement: string;
    levelRequirement: number;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
