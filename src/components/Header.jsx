import React from 'react'
import { motion } from 'framer-motion'
import { Menu, Search, RefreshCw, Filter, Bell } from 'lucide-react'
import { Badge, Dropdown } from 'antd'
import { currentUser } from '../data'

export const Header = ({ collapsed, onToggleSidebar }) => {
  const userMenuItems = [
    { key: 'profile', label: '个人资料' },
    { key: 'settings', label: '设置' },
    { type: 'divider' },
    { key: 'logout', label: '退出登录', danger: true },
  ]

  return (
    <header
      style={{
        height: 64,
        background: 'rgba(19, 19, 26, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'fixed',
        top: 0,
        right: 0,
        left: collapsed ? 72 : 240,
        zIndex: 99,
        transition: 'left 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleSidebar}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.03)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          <Menu size={20} />
        </motion.button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10,
            padding: '8px 16px',
            width: 280,
          }}
        >
          <Search size={18} color="rgba(255,255,255,0.4)" />
          <input
            placeholder="搜索任务、项目..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: 14,
              width: '100%',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.03)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          <RefreshCw size={18} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.03)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          <Filter size={18} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.03)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          <Badge count={3} size="small">
            <Bell size={18} />
          </Badge>
        </motion.button>

        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: currentUser.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              marginLeft: 8,
            }}
          >
            {currentUser.avatar}
          </motion.div>
        </Dropdown>
      </div>
    </header>
  )
}
