import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_configs')
export class UserConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ default: false })
  dontShowTaskCompleteConfirm: boolean;

  @Column({ type: 'jsonb', nullable: true })
  selectedTitles: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 关系定义
  @ManyToOne(() => User, user => user.userConfigs)
  @JoinColumn({ name: 'userId' })
  user: User;
}