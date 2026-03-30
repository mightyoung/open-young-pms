import React, { useState, useEffect } from 'react'
import { colors } from '../styles/theme'
import { Card, Tree, Button, Modal, Form, Input, message, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { api } from '../api'
import SkeletonContent from '../components/SkeletonContent'

const { DirectoryTree } = Tree

export default function Organization() {
  const [treeData, setTreeData] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingNode, setEditingNode] = useState(null)
  const [form] = Form.useForm()

  const loadTree = async () => {
    setLoading(true)
    try {
      const res = await api.get('/departments/tree')
      const data = res?.data || res?.items || []
      const convert = (nodes) => nodes.map(n => ({
        key: n.id, title: n.name,
        isLeaf: !n.children || n.children.length === 0,
        children: n.children ? convert(n.children) : undefined,
        type: n.type,
      }))
      setTreeData(convert(data))
    } catch (e) {
      message.error('加载组织架构失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTree() }, [])

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
      await api.delete(`/departments/${node.key}`)
      message.success('已删除')
      loadTree()
    } catch (e) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const vals = await form.validateFields()
      if (editingNode) {
        await api.put(`/departments/${editingNode.key}`, vals)
      } else {
        await api.post('/departments', { ...vals, company_id: treeData[0]?.key || '' })
      }
      message.success(editingNode ? '已更新' : '已创建')
      setModalOpen(false)
      loadTree()
    } catch (e) {
      message.error('操作失败')
    }
  }

  const renderTreeNodes = (data) =>
    data.map(item => {
      if (item.children) {
        return (
          <Tree.TreeNode key={item.key} title={
            <span style={{ color: colors.text.primary }}>
              {item.title}
              <EditOutlined style={{ marginLeft: 8, fontSize: 12 }} onClick={() => handleEdit(item)} />
              <Popconfirm title="确定删除？" onConfirm={() => handleDelete(item)}>
                <DeleteOutlined style={{ marginLeft: 8, fontSize: 12, color: colors.danger }} />
              </Popconfirm>
            </span>
          }>
            {renderTreeNodes(item.children)}
          </Tree.TreeNode>
        )
      }
      return (
        <Tree.TreeNode key={item.key} title={
          <span style={{ color: colors.text.secondary }}>
            {item.title}
            <EditOutlined style={{ marginLeft: 8, fontSize: 12 }} onClick={() => handleEdit(item)} />
          </span>
        } />
      )
    })

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ color: colors.text.primary, margin: 0 }}>组织架构</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加部门</Button>
      </div>
      <Card style={{ background: colors.bg.card, border: '1px solid #e5e7eb' }}>
        {loading ? <SkeletonContent type='table' /> : (
          <DirectoryTree treeData={treeData} expandAll style={{ color: colors.text.primary }} />
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
