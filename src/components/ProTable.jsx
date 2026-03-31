import React from 'react'
import { Table, Button, Dropdown, Popconfirm, Space, message } from 'antd'
import { MoreOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { colors, radius } from '../styles/theme'

/**
 * 统一表格组件
 * @param {Array} columns - 列定义（支持 extraActions 添加操作列）
 * @param {Array} dataSource - 数据源
 * @param {object} pagination - antd 分页配置 { current, pageSize, total, onChange }
 * @param {boolean} loading - 加载状态
 * @param {function} onDelete - 删除回调（会包裹 Popconfirm）
 * @param {Array} extraActions - 额外操作按钮 [{key, label, icon, onClick}]
 */
export default function ProTable({
  columns = [],
  dataSource = [],
  pagination,
  loading = false,
  onDelete,
  extraActions = [],
  rowKey = 'id',
  ...rest
}) {
  // 构建操作列
  const actionColumn = {
    title: '操作',
    key: 'actions',
    width: extraActions.length > 0 || onDelete ? 120 : 0,
    render: (_, record) => {
      if (extraActions.length === 0 && !onDelete) return null

      const items = [
        ...extraActions.map(a => ({
          key: a.key,
          label: a.label,
          icon: a.icon,
          onClick: () => a.onClick?.(record),
        })),
      ]

      if (onDelete) {
        items.push({
          type: 'divider',
        })
        items.push({
          key: 'delete',
          label: '删除',
          icon: <DeleteOutlined />,
          danger: true,
        })
      }

      const handleMenuClick = ({ key }) => {
        if (key === 'delete' && onDelete) {
          onDelete(record)
        } else {
          const action = extraActions.find(a => a.key === key)
          action?.onClick?.(record)
        }
      }

      return (
        <Space size="small">
          {extraActions.map(a =>
            a.showIcon !== false ? (
              <Button
                key={a.key}
                type="link"
                size="small"
                icon={a.icon}
                onClick={() => a.onClick?.(record)}
                style={{
                  color: a.danger ? colors.danger : colors.accent,
                  padding: '2px 6px',
                  height: 'auto',
                }}
              >
                {a.label}
              </Button>
            ) : null
          )}
          {(extraActions.length > 1 || onDelete) && (
            <Dropdown
              menu={{ items, onClick: handleMenuClick }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button
                type="text"
                size="small"
                icon={<MoreOutlined />}
                style={{ color: colors.text.muted }}
              />
            </Dropdown>
          )}
        </Space>
      )
    },
  }

  // 只有存在操作时才添加操作列
  const cols = [...columns]
  if (actionColumn.width > 0) {
    cols.push(actionColumn)
  }

  const tableColumns = cols.map(c => ({
    ...c,
    title: <span style={{ color: colors.text.secondary, fontSize: 12 }}>{c.title}</span>,
  }))

  return (
    <Table
      rowKey={rowKey}
      columns={tableColumns}
      dataSource={dataSource}
      pagination={pagination || false}
      loading={loading}
      size="middle"
      scroll={{ x: 'max-content' }}
      locale={{
        emptyText: <div style={{ padding: '40px 0', color: colors.text.muted }}>暂无数据</div>,
      }}
      style={{
        background: colors.bg.card,
        borderRadius: radius.lg,
        overflow: 'hidden',
      }}
      {...rest}
    />
  )
}

// 确认删除的高阶组件
export function withDeleteConfirm(Component, onConfirm) {
  return function ConfirmedDelete({ record, ...props }) {
    return (
      <Popconfirm
        title="确认删除？"
        description="此操作不可恢复"
        onConfirm={() => onConfirm(record, props)}
        okText="删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <Component {...props} />
      </Popconfirm>
    )
  }
}
