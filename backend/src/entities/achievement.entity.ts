import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  icon: string;

  @Column({ default: false })
  isCustom: boolean;

  @Column({ nullable: true })
  unlockedAt: Date;

  @Column({ nullable: true })
  triggerType: string;

  @Column({ nullable: true })
  triggerCondition: string;

  @Column({ nullable: true })
  progress: number;

  @Column({ nullable: true })
  target: number;

  @Column({ nullable: true })
  isTitle: boolean;

  @Column({ nullable: true })
  attributeRequirement: string;

  @Column({ nullable: true })
  levelRequirement: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 关系定义
  @ManyToOne(() => User, user => user.achievements)
  @JoinColumn({ name: 'userId' })
  user: User;
}