/**
 * PMS 主入口 - 国企标准蓝白风
 * 更新时间: 2026-03-30
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, theme } from 'antd'
import App from './App'
import './index.css'
import { antdTheme } from './styles/theme'

const themeConfig = {
  algorithm: theme.defaultAlgorithm,
  ...antdTheme,
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={themeConfig}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
)
