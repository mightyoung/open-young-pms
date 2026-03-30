import React from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Kanban,
  Users,
  FileText,
} from 'lucide-react'
import { LogoIcon } from './Icons'
import { currentUser } from '../data'

const menuItems = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
  { id: 'kanban', label: '看板', icon: Kanban },
  { id: 'team', label: '团队', icon: Users },
  { id: 'docs', label: '文档', icon: FileText },
]

export const Sidebar = ({ collapsed, activeMenu, setActiveMenu }) => {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      style={{
        height: '100vh',
        background: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '0 16px' : '0 20px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderBottom: '1px solid #e5e7eb',
        flexShrink: 0,
      }}>
        <LogoIcon size={32} />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#1a1a2e',
              whiteSpace: 'nowrap',
            }}
          >
            ProjectX
          </motion.span>
        )}
      </div>

      {/* 导航 */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {menuItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeMenu === id
          return (
            <motion.button
              key={id}
              onClick={() => setActiveMenu(id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: collapsed ? '10px' : '10px 14px',
                marginBottom: 2,
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                position: 'relative',
                background: isActive ? '#eef3ff' : 'transparent',
                color: isActive ? '#115cb9' : '#8c8c8c',
                transition: 'all 150ms ease-out',
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3,
                    height: 24,
                    background: '#115cb9',
                    borderRadius: '0 3px 3px 0',
                  }}
                />
              )}
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {label}
                </motion.span>
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* 用户信息 */}
      <div style={{
        padding: collapsed ? '16px 12px' : '16px 20px',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #115cb9, #3377cc)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          fontSize: 14,
          color: '#fff',
          flexShrink: 0,
          border: '2px solid #eef3ff',
        }}>
          {currentUser.avatar}
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a2e' }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              {currentUser.role}
            </div>
          </motion.div>
        )}
      </div>
    </motion.aside>
  )
}
