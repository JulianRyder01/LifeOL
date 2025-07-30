import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * 根据邮箱查找用户
   * @param email 用户邮箱
   * @returns 用户信息或null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * 根据ID查找用户
   * @param id 用户ID
   * @returns 用户信息或null
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * 创建新用户
   * @param userData 用户数据
   * @returns 创建的用户信息
   */
  async create(userData: { username: string; email: string; password: string }): Promise<User> {
    // 加密密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    
    // 创建用户实体
    const user = this.userRepository.create({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
    });
    
    // 保存到数据库
    return this.userRepository.save(user);
  }

  /**
   * 更新用户信息
   * @param id 用户ID
   * @param userData 要更新的数据
   * @returns 更新后的用户信息
   */
  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, userData);
    return this.findById(id);
  }
}