import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  icon: string;

  @Column({
    type: 'enum',
    enum: ['equipment', 'consumable', 'trophy']
  })
  type: 'equipment' | 'consumable' | 'trophy';

  @Column({ type: 'jsonb', nullable: true })
  effects: Array<{
    attribute: string;
    type: 'fixed' | 'percentage';
    value: number;
  }>;

  @Column({ default: false })
  used: boolean;

  @Column({ nullable: true })
  usedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 关系定义
  @ManyToOne(() => User, user => user.items)
  @JoinColumn({ name: 'userId' })
  user: User;
}