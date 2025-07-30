import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({ isGlobal: true }),
    
    // 数据库连接
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'lifeol'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_NAME', 'lifeol'),
        autoLoadEntities: true,
        synchronize: true, // 仅在开发环境使用
      }),
      inject: [ConfigService],
    }),
    
    // 功能模块
    AuthModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}