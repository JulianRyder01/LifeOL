import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('attributes')
export class Attribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  attribute: string; // int, str, vit, cha, eq, cre

  @Column()
  level: number;

  @Column()
  exp: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 关系定义
  @ManyToOne(() => User, user => user.attributes)
  @JoinColumn({ name: 'userId' })
  user: User;
}