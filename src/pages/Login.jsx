import React, { useState } from 'react'
import { api } from '../api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await api.login(username, password)
      if (data?.access_token) {
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        // Reload to reflect logged-in state
        window.location.reload()
      }
    } catch (err) {
      setError(err.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0e' }}>
      <form onSubmit={handleLogin} style={{ background: '#13131a', padding: '40px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)', width: 360 }}>
        <h2 style={{ color: '#e4e4e7', textAlign: 'center', marginBottom: 24 }}>ProjectX 登录</h2>
        {error && <div style={{ color: '#ef4444', marginBottom: 16, textAlign: 'center', fontSize: 13 }}>{error}</div>}
        <input
          placeholder="用户名"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ width: '100%', padding: '12px 14px', marginBottom: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: '#0a0a0e', color: '#e4e4e7', boxSizing: 'border-box' }}
        />
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', padding: '12px 14px', marginBottom: 20, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: '#0a0a0e', color: '#e4e4e7', boxSizing: 'border-box' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: loading ? '#6366f180' : '#6366f1', color: 'white', fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? '登录中...' : '登录'}
        </button>
        <div style={{ marginTop: 16, textAlign: 'center', color: '#52525b', fontSize: 12 }}>
          用户名: admin | 密码: admin123
        </div>
      </form>
    </div>
  )
}
