import React, { useEffect, useState } from 'react'
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Tag,
  Space,
  Popconfirm,
  Drawer,
  Checkbox,
  Row,
  Col,
  message,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { useRoles } from '../hooks/useRoles'
import { ROLES, ROLE_LABELS, ROLE_COLORS } from '../../../constants/permissions'
import SkeletonContent from '../../../components/SkeletonContent'

const ALL_PERMISSIONS = [
  { key: 'project:read:all', label: '查看所有项目' },
  { key: 'project:manage', label: '管理项目' },
  { key: 'approval:all', label: '全部审批' },
  { key: 'approval:dept', label: '部门审批' },
  { key: 'approval:section', label: '科室审批' },
  { key: 'report:read:all', label: '查看所有报告' },
  { key: 'report:manage', label: '管理报告' },
  { key: 'issue:manage', label: '管理隐患' },
  { key: 'issue:verify', label: '验收隐患' },
  { key: 'ai:chat', label: 'AI 助手' },
  { key: 'ai:chat:project', label: '项目 AI' },
  { key: 'task:*', label: '任务管理' },
  { key: 'monitor:view', label: '监测查看' },
]

export default function RolesPage() {
  const {
    roles,
    loading,
    loadRoles,
    createRole,
    updateRole,
    deleteRole,
    updateRolePermissions,
  } = useRoles()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [rolePermissions, setRolePermissions] = useState([])
  const [form] = Form.useForm()

  useEffect(() => {
    loadRoles()
  }, [loadRoles])

  const handleAdd = () => {
    setEditingRole(null)
    form.resetFields()
    setModalOpen(true)
  }

  const handleEdit = (role) => {
    setEditingRole(role)
    form.setFieldsValue({ name: role.name, label: role.label })
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    const success = await deleteRole(id)
    if (success) {
      message.success('删除成功')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingRole) {
        await updateRole(editingRole.id, values)
      } else {
        await createRole(values)
      }
      setModalOpen(false)
    } catch {
      // Validation failed or API error
    }
  }

  const handleEditPermissions = (role) => {
    setSelectedRole(role)
    // Backend returns permissions as object, frontend uses array
    const perms = role.permissions ? Object.keys(role.permissions) : []
    setRolePermissions(perms)
    setDrawerOpen(true)
  }

  const handleSavePermissions = async () => {
    if (selectedRole) {
      const success = await updateRolePermissions(selectedRole.id, rolePermissions)
      if (success) {
        setDrawerOpen(false)
      }
    }
  }

  const columns = [
    {
      title: '角色代码',
      dataIndex: 'name',
      key: 'name',
      render: name => (
        <Tag color={ROLE_COLORS[name] || 'default'}>
          {name}
        </Tag>
      ),
    },
    {
      title: '角色名称',
      dataIndex: 'label',
      key: 'label',
      render: label => <span style={{ fontWeight: 600 }}>{label}</span>,
    },
    {
      title: '系统角色',
      dataIndex: 'is_system',
      key: 'is_system',
      render: isSystem => isSystem ? '是' : '否',
    },
    {
      title: '权限数量',
      key: 'permissionCount',
      render: (_, record) => {
        const perms = record.permissions ? Object.keys(record.permissions) : []
        return <span>{perms.length} 项</span>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<SafetyCertificateOutlined />}
            onClick={() => handleEditPermissions(record)}
          >
            权限
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.name !== ROLES.SUPER_ADMIN && (
            <Popconfirm
              title="确定删除此角色？"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: 24, background: '#f5f7fa', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ color: '#323235', margin: 0 }}>角色管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建角色
        </Button>
      </div>

      <Card>
        {loading ? (
          <SkeletonContent type="table" />
        ) : (
          <Table
            dataSource={roles}
            columns={columns}
            rowKey="id"
            pagination={false}
          />
        )}
      </Card>

      {/* 新建/编辑角色 Modal */}
      <Modal
        title={editingRole ? '编辑角色' : '新建角色'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="角色代码"
            rules={[{ required: true, message: '请输入角色代码' }]}
          >
            <Input placeholder="如: project_manager" disabled={!!editingRole} />
          </Form.Item>
          <Form.Item
            name="label"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="如: 项目经理" />
          </Form.Item>
          <Form.Item name="permissions" label="权限">
            <Input.TextArea placeholder="权限 JSON" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 权限配置 Drawer */}
      <Drawer
        title={`配置角色权限 - ${selectedRole?.label || ''}`}
        placement="right"
        width={480}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Button type="primary" onClick={handleSavePermissions}>
            保存
          </Button>
        }
      >
        {selectedRole && (
          <div>
            <div style={{ marginBottom: 16, color: '#666' }}>
              当前角色：{ROLE_LABELS[selectedRole.name] || selectedRole.label}
            </div>
            <Checkbox.Group
              value={rolePermissions}
              onChange={(checkedValues) => setRolePermissions(checkedValues)}
              style={{ width: '100%' }}
            >
              <Row gutter={[16, 16]}>
                {ALL_PERMISSIONS.map(perm => (
                  <Col span={24} key={perm.key}>
                    <Checkbox value={perm.key}>
                      {perm.label}
                      <span style={{ color: '#999', marginLeft: 8 }}>({perm.key})</span>
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </div>
        )}
      </Drawer>
    </div>
  )
}
