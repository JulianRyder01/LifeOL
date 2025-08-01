import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './src/app'
import './src/css/main.css'
import './src/css/lucide.css'

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)