import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProjectEvent } from './project-event.entity';

@Entity('project_event_progress_logs')
export class ProjectEventProgressLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectEventId: string;

  @Column({ type: 'float' })
  change: number;

  @Column()
  reason: string;

  @Column()
  timestamp: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 关系定义
  @ManyToOne(() => ProjectEvent, projectEvent => projectEvent.progressLogs)
  @JoinColumn({ name: 'projectEventId' })
  projectEvent: ProjectEvent;
}