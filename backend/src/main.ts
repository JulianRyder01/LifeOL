import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 配置 CORS
  app.enableCors();
  
  // 配置全局前缀
  app.setGlobalPrefix('api/v1');
  
  // 配置 Swagger
  const config = new DocumentBuilder()
    .setTitle('LifeOL API')
    .setDescription('人生Online 后端 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  
  // 启动服务器
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`LifeOL Backend is running on: http://localhost:${port}`);
  console.log(`API Documentation available at: http://localhost:${port}/api-docs`);
}
bootstrap();