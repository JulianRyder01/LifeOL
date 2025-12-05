import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/postcss' // <-- 关键改动：导入正确的插件

<<<<<<< HEAD
export default defineConfig({
=======
// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // 判断是否为生产环境构建
  const isProduction = mode === 'production';

  return {
    // 核心修复：开发环境使用根路径，生产环境使用仓库名路径
    base: isProduction ? '/LifeOL/' : '/',
    
>>>>>>> temp
  plugins: [react()],
  // 直接在 vite config 中定义 css 和 postcss
  css: {
    postcss: {
      plugins: [
        tailwindcss, // <-- 关键改动：直接使用导入的插件
      ],
    },
  },
  server: {
    host: '0.0.0.0',
      port: 3000,
      open: true // 自动打开浏览器
  },
  build: {
<<<<<<< HEAD
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['./src/utils/calculations.ts', './src/utils/storage.ts', './src/utils/achievements.ts'],
          hooks: ['./src/hooks/useApp.ts']
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
=======
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false
  },
    root: '.',
    publicDir: 'public',
>>>>>>> temp
  }
})