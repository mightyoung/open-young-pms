import React, { useEffect, useState } from 'react'
import { Card, Tree, Button, Modal, Form, Input, message, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useOrganization } from '../hooks/useOrganization'
import SkeletonContent from '../../../components/SkeletonContent'

const { DirectoryTree } = Tree

const D = { bg: '#f5f7fa', card: '#ffffff', border: '#e5e7eb', text: '#323235', textSec: '#5f5f61', textMuted: '#8c8c8c', danger: '#ff4d4f' }

function TreeNodeActions({ node, onEdit, onDelete }) {
  return (
    <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <span style={{ color: D.textSec }}>{node.title}</span>
      <EditOutlined style={{ fontSize: 12, color: D.textMuted, cursor: 'pointer' }} onClick={() => onEdit(node)} />
      <Popconfirm title="确定删除？" onConfirm={() => onDelete(node)}>
        <DeleteOutlined style={{ fontSize: 12, color: D.danger, cursor: 'pointer' }} />
      </Popconfirm>
    </span>
  )
}

export default function OrganizationPage() {
  const { treeData, loading, loadTree, create, update, remove } = useOrganization()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingNode, setEditingNode] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => { loadTree() }, [loadTree])

  const handleAdd = () => {
    setEditingNode(null)
    form.resetFields()
    setModalOpen(true)
  }

  const handleEdit = (node) => {
    setEditingNode(node)
    form.setFieldsValue({ name: node.title })
    setModalOpen(true)
  }

  const handleDelete = async (node) => {
    try {
      await remove(node.key)
      message.success('已删除')
    } catch {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const vals = await form.validateFields()
      if (editingNode) {
        await update(editingNode.key, vals)
        message.success('已更新')
      } else {
        await create({ ...vals, company_id: treeData[0]?.key || '' })
        message.success('已创建')
      }
      setModalOpen(false)
    } catch {
      message.error('操作失败')
    }
  }

  const convertForDisplay = (nodes) =>
    nodes.map(n => ({
      key: n.key,
      title: <TreeNodeActions node={n} onEdit={handleEdit} onDelete={handleDelete} />,
      isLeaf: n.isLeaf,
      children: n.children ? convertForDisplay(n.children) : undefined,
    }))

  return (
    <div style={{ padding: 24, background: D.bg, minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ color: D.text, margin: 0 }}>组织架构</h2>
        <Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: 8 }} onClick={handleAdd}>
          添加部门
        </Button>
      </div>
      <Card style={{ background: D.card, border: `1px solid ${D.border}` }}>
        {loading ? <SkeletonContent type="table" /> : (
          <DirectoryTree treeData={convertForDisplay(treeData)} expandAll />
        )}
      </Card>

      <Modal
        title={editingNode ? '编辑部门' : '新建部门'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="部门名称" rules={[{ required: true }]}>
            <Input placeholder="请输入部门名称" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
