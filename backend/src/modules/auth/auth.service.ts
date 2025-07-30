import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * 验证用户凭据
   * @param email 用户邮箱
   * @param password 用户密码
   * @returns 验证通过的用户信息或null
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      // 移除密码字段后返回用户信息
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * 用户登录
   * @param user 用户信息
   * @returns JWT token和用户信息
   */
  async login(user: User) {
    const payload = { 
      username: user.username, 
      sub: user.id,
      email: user.email
    };
    
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      token: this.jwtService.sign(payload),
    };
  }

  /**
   * 用户注册
   * @param userData 用户注册信息
   * @returns JWT token和用户信息
   */
  async register(userData: { username: string; email: string; password: string }) {
    // 检查用户是否已存在
    const existingUser = await this.userService.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('用户已存在');
    }

    // 创建新用户
    const user = await this.userService.create(userData);
    
    // 登录并返回token
    return this.login(user);
  }

  /**
   * 刷新token
   * @param refreshToken 刷新token
   * @returns 新的JWT token
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userService.findById(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException();
      }
      
      const newPayload = { 
        username: user.username, 
        sub: user.id,
        email: user.email
      };
      
      return {
        token: this.jwtService.sign(newPayload),
        refreshToken: this.jwtService.sign(newPayload, { 
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d')
        }),
      };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}