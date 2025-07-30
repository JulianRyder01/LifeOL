import { Controller, Post, Body, UseGuards, Req, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * 用户注册
   * @param userData 用户注册信息
   */
  @Post('register')
  async register(
    @Body() userData: { username: string; email: string; password: string },
  ) {
    return this.authService.register(userData);
  }

  /**
   * 用户登录
   */
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
  async login(@Req() req: Request) {
    return this.authService.login(req.user as any);
  }

  /**
   * 刷新token
   */
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@Req() req: Request) {
    // 从请求体中获取refreshToken，如果没有则从Authorization头中获取
    const refreshToken = req.body?.refreshToken || req.get('Authorization')?.split(' ')[1];
    if (!refreshToken) {
      throw new Error('缺少刷新token');
    }
    return this.authService.refreshToken(refreshToken);
  }
}