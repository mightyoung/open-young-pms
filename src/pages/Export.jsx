import React, { useState } from 'react'
import { Card, Typography, Button, Table, message } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { api } from '../api'

const { Title, Text } = Typography

const EXPORT_TYPES = [
  { key: 'hazards', label: '隐患数据', icon: '⚠️' },
  { key: 'reports', label: '报告数据', icon: '📄' },
  { key: 'risks', label: '风险数据', icon: '🚨' },
  { key: 'contracts', label: '合同数据', icon: '📋' },
]

export default function Export() {
  const [loading, setLoading] = useState(null)
  const [lastResult, setLastResult] = useState(null)

  const handleExport = async type => {
    setLoading(type)
    try {
      const res = await api.get(`/export/${type}`)
      const data = res?.data || res || {}
      setLastResult(data)
      if (data.download_url) {
        const link = document.createElement('a')
        link.href = `http://localhost:8001${data.download_url}`
        link.download = data.file_name || 'export.csv'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        message.success(`导出成功，共 ${data.record_count || 0} 条记录`)
      } else {
        message.info(`导出完成，共 ${data.record_count || 0} 条记录`)
      }
    } catch (e) {
      message.error('导出失败：' + (e.message || '未知错误'))
    } finally {
      setLoading(null)
    }
  }

  const columns = [
    {
      title: '文件名',
      dataIndex: 'file_name',
      render: t => <Text style={{ color: '#1a1a2e' }}>{t || '-'}</Text>,
    },
    {
      title: '记录数',
      dataIndex: 'record_count',
      render: v => <Text style={{ color: '#52c41a', fontWeight: 600 }}>{v ?? '-'}</Text>,
    },
    {
      title: '下载链接',
      dataIndex: 'download_url',
      render: u =>
        u ? (
          <a
            href={`http://localhost:8001${u}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#115cb9' }}
          >
            点击下载
          </a>
        ) : (
          <Text style={{ color: '#8c8c8c' }}>-</Text>
        ),
    },
  ]

  return (
    <div style={{ padding: 24, background: '#f5f7fa', minHeight: '100vh' }}>
      <Title level={4} style={{ color: '#1a1a2e', marginBottom: 16 }}>
        <DownloadOutlined style={{ marginRight: 8 }} />
        数据导出
      </Title>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {EXPORT_TYPES.map(t => (
          <Card
            key={t.key}
            style={{ background: '#ffffff', border: '1px solid #e5e7eb', cursor: 'pointer' }}
            onClick={() => handleExport(t.key)}
            hoverable
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{t.icon}</div>
              <Text style={{ color: '#1a1a2e', fontSize: 15, display: 'block' }}>{t.label}</Text>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                loading={loading === t.key}
                style={{ marginTop: 12 }}
                onClick={e => {
                  e.stopPropagation()
                  handleExport(t.key)
                }}
              >
                导出 CSV
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {lastResult && (
        <Card
          title={<Text style={{ color: '#1a1a2e' }}>最近导出</Text>}
          style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
        >
          <Table
            dataSource={[lastResult]}
            columns={columns}
            rowKey="file_name"
            pagination={false}
            size="small"
          />
        </Card>
      )}

      <Card style={{ background: '#ffffff', border: '1px solid #e5e7eb', marginTop: 16 }}>
        <Text style={{ color: '#8c8c8c', fontSize: 12 }}>
          💡 提示：导出文件格式为 CSV（Excel兼容），可直接用 Excel
          打开。导出的文件保存在服务器临时目录。
        </Text>
      </Card>
    </div>
  )
}
