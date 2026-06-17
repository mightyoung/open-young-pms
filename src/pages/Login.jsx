/**
 * 登录页 - 蓝白主题
 * 更新时间: 2026-03-30
 */
import React, { useState } from 'react'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const navigate = useNavigate()
  const { login, rememberedUser } = useAuth()
  const [username, setUsername] = useState(() => rememberedUser || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedUser))

  const handleLogin = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login({ username, password, rememberMe })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || '登录失败，请检查用户名和密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.bgDecoration}>
        <div style={styles.bgCircle1} />
        <div style={styles.bgCircle2} />
      </div>

      <div style={styles.card}>
        <div style={styles.logoSection}>
          <div style={styles.logoPlaceholder}>
            <span style={styles.logoText}>PMS</span>
          </div>
          <h1 style={styles.title}>项目管理平台</h1>
          <p style={styles.subtitle}>Construction Project Management System</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          {error && <div style={styles.errorAlert}>{error}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.label}>用户名</label>
            <div style={styles.inputWrapper}>
              <UserOutlined style={styles.inputIcon} />
              <input
                type="text"
                placeholder="请输入用户名"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>密码</label>
            <div style={styles.inputWrapper}>
              <LockOutlined style={styles.inputIcon} />
              <input
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.rememberRow}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                style={styles.checkbox}
              />
              <span>记住我</span>
            </label>
            <a href="#" style={styles.forgotLink}>
              忘记密码？
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.loginBtn,
              background: loading ? '#9ca3af' : '#115cb9',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div style={styles.footer}>
          <span style={styles.hint}>请使用已初始化的系统账号登录</span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f7fa',
    position: 'relative',
    overflow: 'hidden',
  },
  bgDecoration: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  bgCircle1: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: '#d7e2ff',
    opacity: 0.5,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: '-30%',
    left: '-15%',
    width: 800,
    height: 800,
    borderRadius: '50%',
    background: '#d7e2ff',
    opacity: 0.3,
  },
  card: {
    background: '#ffffff',
    borderRadius: 24,
    padding: '48px 40px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 20px 60px rgba(17, 92, 185, 0.1)',
    position: 'relative',
    zIndex: 1,
  },
  logoSection: { textAlign: 'center', marginBottom: 32 },
  logoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 16,
    background: '#115cb9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  logoText: { color: '#ffffff', fontSize: 20, fontWeight: 700 },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#323235',
    marginBottom: 4,
  },
  subtitle: { fontSize: 13, color: '#8c8c8c' },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  errorAlert: {
    background: '#fef2f2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: 12,
    fontSize: 14,
    textAlign: 'center',
    border: '1px solid #fecaca',
  },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 14, fontWeight: 500, color: '#323235' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: {
    position: 'absolute',
    left: 14,
    color: '#8c8c8c',
    fontSize: 16,
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    background: '#f9fafb',
    color: '#323235',
    fontSize: 15,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  },
  rememberRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    color: '#8c8c8c',
    cursor: 'pointer',
  },
  checkbox: { width: 16, height: 16, cursor: 'pointer' },
  forgotLink: { fontSize: 14, color: '#115cb9', textDecoration: 'none' },
  loginBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: 12,
    border: 'none',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 600,
    transition: 'all 0.2s',
    marginTop: 8,
  },
  footer: { marginTop: 24, textAlign: 'center' },
  hint: { fontSize: 12, color: '#8c8c8c' },
}
