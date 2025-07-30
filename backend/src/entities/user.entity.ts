import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Attribute } from './attribute.entity';
import { Event } from './event.entity';
import { ProjectEvent } from './project-event.entity';
import { Item } from './item.entity';
import { Achievement } from './achievement.entity';
import { UserConfig } from './user-config.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 关系定义
  @OneToMany(() => Attribute, attribute => attribute.user)
  attributes: Attribute[];

  @OneToMany(() => Event, event => event.user)
  events: Event[];

  @OneToMany(() => ProjectEvent, projectEvent => projectEvent.user)
  projectEvents: ProjectEvent[];

  @OneToMany(() => Item, item => item.user)
  items: Item[];

  @OneToMany(() => Achievement, achievement => achievement.user)
  achievements: Achievement[];

  @OneToMany(() => UserConfig, userConfig => userConfig.user)
  userConfigs: UserConfig[];
}