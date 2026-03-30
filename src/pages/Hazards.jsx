import React, { useState, useEffect } from 'react'
import { api } from '../api'
import SkeletonContent from '../components/SkeletonContent'

const STATUS_MAP = {
  pending: { label: '待分配', color: '#71717a' },
  assigned: { label: '已分配', color: '#6366f1' },
  confirmed: { label: '已确认', color: '#06b6d4' },
  pushed: { label: '已下推', color: '#f59e0b' },
  rectifying: { label: '整改中', color: '#f97316' },
  pending_acceptance: { label: '待验收', color: '#ec4899' },
  closed: { label: '已关闭', color: '#22c55e' },
  rejected: { label: '已驳回', color: '#ef4444' },
}

const TYPE_MAP = {
  safety: { label: '安全生产', color: '#ef4444' },
  quality: { label: '质量缺陷', color: '#f59e0b' },
  environment: { label: '环境问题', color: '#22c55e' },
}

export default function Hazards() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    loadData()
  }, [tab])

  const loadData = async () => {
    setLoading(true)
    try {
      const params = tab !== 'all' ? { status: tab } : {}
      const [reportsData, statsData] = await Promise.all([
        api.hazards.list(params).catch(() => ({ items: [] })),
        api.hazards.stats().catch(() => null),
      ])
      setReports(reportsData?.items || [])
      setStats(statsData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ color: '#e4e4e7', margin: 0 }}>随手拍隐患管理</h2>
          <p style={{ color: '#a1a1aa', margin: '4px 0 0', fontSize: 13 }}>
            共 {reports.length} 条记录
          </p>
        </div>
        <button
          onClick={() => alert('上报功能开发中')}
          style={{ padding: '8px 20px', borderRadius: 10, border: 'none', background: '#6366f1', color: 'white', cursor: 'pointer', fontSize: 14 }}
        >
          + 上报隐患
        </button>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          {Object.entries(stats.by_status || {}).map(([status, count]) => {
            const cfg = STATUS_MAP[status] || { label: status, color: '#71717a' }
            return (
              <div key={status} style={{ background: '#1a1a22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 20px', minWidth: 80 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: cfg.color }}>{count}</div>
                <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 4 }}>{cfg.label}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* 状态标签页 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[['all', '全部'], ...Object.entries(STATUS_MAP)].map(([key, val]) => {
          const label = typeof val === 'string' ? val : val.label
          const isActive = tab === key
          return (
            <button key={key} onClick={() => setTab(key)}
              style={{ padding: '4px 14px', borderRadius: 8, border: '1px solid', borderColor: isActive ? '#6366f1' : 'rgba(255,255,255,0.1)', background: isActive ? '#6366f115' : 'transparent', color: isActive ? '#6366f1' : '#a1a1aa', fontSize: 12, cursor: 'pointer' }}>
              {label}
            </button>
          )
        })}
      </div>

      {/* 列表 */}
      {loading ? <SkeletonContent type='table' /> : reports.length === 0 ? (
        <div style={{ color: '#52525b', textAlign: 'center', padding: 60 }}>暂无数据</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reports.map(r => {
            const typeCfg = TYPE_MAP[r.hazard_type] || { label: r.hazard_type, color: '#71717a' }
            const statusCfg = STATUS_MAP[r.status] || { label: r.status, color: '#71717a' }
            return (
              <div key={r.id} style={{ background: '#1a1a22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#e4e4e7', marginBottom: 6 }}>{r.title}</div>
                    <div style={{ fontSize: 12, color: '#71717a', marginBottom: 8 }}>{r.location}</div>
                    <div style={{ fontSize: 12, color: '#52525b' }}>{r.description?.slice(0, 80)}{r.description?.length > 80 ? '...' : ''}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, marginLeft: 16 }}>
                    <span style={{ padding: '2px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: `${typeCfg.color}15`, color: typeCfg.color, border: `1px solid ${typeCfg.color}30` }}>
                      {typeCfg.label}
                    </span>
                    <span style={{ padding: '2px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: `${statusCfg.color}15`, color: statusCfg.color, border: `1px solid ${statusCfg.color}30` }}>
                      {statusCfg.label}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
