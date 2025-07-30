import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  timestamp: Date;

  @Column({ type: 'jsonb' })
  expGains: Record<string, number>;

  @Column({ nullable: true })
  relatedItemId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * 事件与用户的关系：一个事件属于一个用户
   */
  @ManyToOne(() => User, user => user.events)
  @JoinColumn({ name: 'userId' })
  user: User;
}