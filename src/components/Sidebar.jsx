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
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        height: '100vh',
        background: 'rgba(19, 19, 26, 0.95)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{
        padding: collapsed ? '20px 16px' : '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <LogoIcon size={32} />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              fontSize: 20,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ProjectX
          </motion.span>
        )}
      </div>

      <nav style={{ flex: 1, padding: '16px 8px' }}>
        {menuItems.map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            onClick={() => setActiveMenu(id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: collapsed ? '12px' : '12px 16px',
              marginBottom: 4,
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              position: 'relative',
              background: activeMenu === id
                ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.15), transparent)'
                : 'transparent',
              color: activeMenu === id ? '#fff' : 'rgba(255,255,255,0.6)',
              transition: 'all 0.2s ease',
            }}
          >
            {activeMenu === id && (
              <motion.div
                layoutId="activeIndicator"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 2,
                  height: 24,
                  background: '#6366f1',
                  borderRadius: 2,
                }}
              />
            )}
            <Icon size={20} />
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ fontSize: 14, fontWeight: activeMenu === id ? 600 : 400 }}
              >
                {label}
              </motion.span>
            )}
          </motion.button>
        ))}
      </nav>

      <div style={{
        padding: collapsed ? '16px 12px' : '16px 20px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: currentUser.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          fontSize: 14,
          flexShrink: 0,
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
            <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              {currentUser.role}
            </div>
          </motion.div>
        )}
      </div>
    </motion.aside>
  )
}
