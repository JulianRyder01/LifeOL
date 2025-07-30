import { User } from './user.entity';
import { ProjectEventProgressLog } from './project-event-progress-log.entity';
export declare class ProjectEvent {
    id: string;
    userId: string;
    title: string;
    description: string;
    progress: number;
    attributeRewards: Record<string, number>;
    itemRewards: string[];
    completedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    progressLogs: ProjectEventProgressLog[];
}
