import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({ isGlobal: true }),
    
    // 数据库连接
    TypeOrmModule.forRoot(typeOrmConfig),
    
    // 功能模块
    AuthModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}