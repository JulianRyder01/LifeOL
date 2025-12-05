import React from 'react'
import ReactDOM from 'react-dom/client'
<<<<<<< HEAD:frontend/main.tsx
import App from './src/app'
import './src/css/main.css'
import './src/css/lucide.css'
=======
import App from './app'
import './index.css' // 核心修复：引入样式文件
>>>>>>> temp:frontend/src/main.tsx

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)