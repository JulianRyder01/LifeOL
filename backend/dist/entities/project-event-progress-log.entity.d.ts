import { ProjectEvent } from './project-event.entity';
export declare class ProjectEventProgressLog {
    id: string;
    projectEventId: string;
    change: number;
    reason: string;
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
    projectEvent: ProjectEvent;
}
