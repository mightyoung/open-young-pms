/**
 * PMS 主入口 - 国企标准蓝白风
 * 更新时间: 2026-03-30
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, theme } from 'antd'
import App from './App'
import './index.css'

const themeConfig = {
  algorithm: theme.defaultAlgorithm,
  tokens: {
    colorPrimary: '#115cb9',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f5f7fa',
    colorBorder: '#e5e7eb',
    colorText: '#1a1a2e',
    colorTextSecondary: '#5f5f61',
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={themeConfig}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
)
