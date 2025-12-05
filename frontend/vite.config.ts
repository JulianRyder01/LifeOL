import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // 判断是否为生产环境构建
  const isProduction = mode === 'production';

  return {
    // 核心修复：开发环境使用根路径，生产环境使用仓库名路径
    base: isProduction ? '/LifeOL/' : '/',
    
  plugins: [react()],
  server: {
    host: '0.0.0.0',
      port: 3000,
      open: true // 自动打开浏览器
  },
  build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false
  },
    root: '.',
    publicDir: 'public',
  }
})