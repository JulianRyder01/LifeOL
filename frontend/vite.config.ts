import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/postcss' // <-- 关键改动：导入正确的插件

export default defineConfig({
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
    port: 3000
  },
  build: {
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
  }
})