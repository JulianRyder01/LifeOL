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

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * 与ProjectEvent的关联关系
   * 一个ProjectEvent可以有多个进度日志
   */
  @ManyToOne(() => ProjectEvent, projectEvent => projectEvent.progressLogs)
  @JoinColumn({ name: 'projectEventId' })
  projectEvent: ProjectEvent;
}