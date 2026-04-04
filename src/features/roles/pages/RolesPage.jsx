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
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { useRoles } from '../hooks/useRoles'
import { ROLES, ROLE_LABELS, ROLE_COLORS, PERMISSION_MATRIX } from '../../../constants/permissions'
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
    form.setFieldsValue({ name: role.name, description: role.description })
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    await deleteRole(id)
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
    setRolePermissions(PERMISSION_MATRIX[role.code] || [])
    setDrawerOpen(true)
  }

  const handleSavePermissions = async () => {
    if (selectedRole) {
      await updateRolePermissions(selectedRole.id, rolePermissions)
      setDrawerOpen(false)
    }
  }

  const columns = [
    {
      title: '角色编码',
      dataIndex: 'code',
      key: 'code',
      render: code => (
        <Tag color={ROLE_COLORS[code] || 'default'}>
          {code}
        </Tag>
      ),
    },
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      render: name => <span style={{ fontWeight: 600 }}>{name}</span>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: desc => desc || '-',
    },
    {
      title: '权限数量',
      key: 'permissionCount',
      render: (_, record) => {
        const perms = PERMISSION_MATRIX[record.code] || []
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
          {record.code !== ROLES.SUPER_ADMIN && (
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
            name="code"
            label="角色编码"
            rules={[{ required: true, message: '请输入角色编码' }]}
          >
            <Input placeholder="如: project_manager" disabled={!!editingRole} />
          </Form.Item>
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="如: 项目经理" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="角色描述..." rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 权限配置 Drawer */}
      <Drawer
        title={`配置角色权限 - ${selectedRole?.name || ''}`}
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
              当前角色：{ROLE_LABELS[selectedRole.code] || selectedRole.name}
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
