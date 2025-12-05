import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app'
import './index.css' // 核心修复：引入样式文件

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)