import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { ProjectEventProgressLog } from './project-event-progress-log.entity';

@Entity('project_events')
export class ProjectEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'float' })
  progress: number;

  @Column({ type: 'jsonb', nullable: true })
  attributeRewards: Record<string, number>;

  @Column({ type: 'jsonb', nullable: true })
  itemRewards: string[];

  @Column({ nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 关系定义
  @ManyToOne(() => User, user => user.projectEvents)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => ProjectEventProgressLog, log => log.projectEvent)
  progressLogs: ProjectEventProgressLog[];
}