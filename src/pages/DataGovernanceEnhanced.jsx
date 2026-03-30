import React, { useState } from 'react';
import { Card, Table, Tag, Space, Button, Modal, Form, Input, Select, Row, Col, Typography, Progress, Badge, Divider, Tabs, message, Statistic } from 'antd';
import { Database, Shield, CheckCircle2, AlertTriangle, Clock, Lock, Unlock, Setting, Plus, Edit2, Eye, FileSearch } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const { Title, Text, Paragraph } = Typography;

const COLORS = {
  primary: '#115cb9',
  success: '#52c41a',
  warning: '#faad14',
  danger: '#ff4d4f',
  bg: '#f5f7fa',
  card: '#ffffff',
  border: '#e5e7eb',
  text: '#323235',
  textMuted: '#8c8c8c',
};

const SECURITY_LEVELS = [
  { value: 'public', label: '公开', color: COLORS.success, desc: '无敏感信息，可对外展示' },
  { value: 'internal', label: '内部', color: COLORS.warning, desc: '企业内部信息，需授权访问' },
  { value: 'confidential', label: '机密', color: COLORS.danger, desc: '商业秘密，严格控制访问' },
];

const DATA_QUALITY = {
  overall: 92,
  completeness: 95,
  accuracy: 89,
  consistency: 97,
  timeliness: 88,
};

const ASSET_LIST = [
  { id: 1, name: '项目信息', category: '业务数据', owner: '项目管理部', count: 18, updateFreq: '低频', securityLevel: 'internal' },
  { id: 2, name: '问题记录', category: '业务数据', owner: '质量安全部', count: 1245, updateFreq: '高频', securityLevel: 'internal' },
  { id: 3, name: '任务数据', category: '业务数据', owner: '项目管理部', count: 3890, updateFreq: '高频', securityLevel: 'internal' },
  { id: 4, name: '报告数据', category: '业务数据', owner: '综合部', count: 892, updateFreq: '每日', securityLevel: 'internal' },
  { id: 5, name: '合同数据', category: '财务数据', owner: '财务部', count: 45, updateFreq: '低频', securityLevel: 'confidential' },
  { id: 6, name: '用户数据', category: '系统数据', owner: '信息中心', count: 156, updateFreq: '低频', securityLevel: 'confidential' },
];

const DICT_ITEMS = [
  { id: 1, code: 'PROJ_TYPE', name: '项目类型', category: '项目管理', items: '产线改造,设备采购安装,厂房建设,技术研发,其他', count: 5 },
  { id: 2, code: 'HAZARD_TYPE', name: '隐患类型', category: '安全管理', items: '安全隐患,质量缺陷,设备故障,工艺偏差,环境问题,进度异常', count: 6 },
  { id: 3, code: 'URGENCY', name: '紧急程度', category: '系统配置', items: '紧急,重要,普通', count: 3 },
  { id: 4, code: 'PROJECT_IDENTITY', name: '我方身份', category: '项目管理', items: '甲方(业主),乙方(承建方)', count: 2 },
  { id: 5, code: 'RISK_LEVEL', name: '风险等级', category: '风险管理', items: '极高,高,中,低', count: 4 },
  { id: 6, code: 'DATA_LEVEL', name: '数据安全等级', category: '数据治理', items: '公开,内部,机密', count: 3 },
];

const QUALITY_TREND = [
  { month: '1月', completeness: 90, accuracy: 85, consistency: 95, timeliness: 82 },
  { month: '2月', completeness: 92, accuracy: 87, consistency: 96, timeliness: 85 },
  { month: '3月', completeness: 95, accuracy: 89, consistency: 97, timeliness: 88 },
];

export default function DataGovernanceEnhanced() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dictModal, setDictModal] = useState(false);
  const [assetModal, setAssetModal] = useState(false);

  const assetColumns = [
    { title: '数据资产', dataIndex: 'name', key: 'name', width: 200, render: (text, record) => (
      <Space><Database size={14} color={COLORS.primary} /><span style={{ fontWeight: 500 }}>{text}</span></Space>
    )},
    { title: '分类', dataIndex: 'category', key: 'category', width: 120 },
    { title: '数据量', dataIndex: 'count', key: 'count', width: 100, render: (v) => v?.toLocaleString() },
    { title: '所有者', dataIndex: 'owner', key: 'owner', width: 120 },
    { title: '更新频率', dataIndex: 'updateFreq', key: 'updateFreq', width: 100 },
    { title: '安全等级', dataIndex: 'securityLevel', key: 'securityLevel', width: 100,
      render: (v) => {
        const level = SECURITY_LEVELS.find(s => s.value === v);
        return <Tag color={level?.color}>{level?.label}</Tag>;
      }
    },
    { title: '操作', key: 'action', width: 120, render: () => (
      <Space>
        <Button type="text" size="small" icon={<Eye size={14} />} />
        <Button type="text" size="small" icon={<Setting size={14} />} />
      </Space>
    )}
  ];

  const dictColumns = [
    { title: '编码', dataIndex: 'code', key: 'code', width: 150, render: (v) => <code style={{ fontSize: 12 }}>{v}</code> },
    { title: '名称', dataIndex: 'name', key: 'name', width: 150 },
    { title: '分类', dataIndex: 'category', key: 'category', width: 120 },
    { title: '选项值', dataIndex: 'items', key: 'items', ellipsis: true },
    { title: '数量', dataIndex: 'count', key: 'count', width: 80 },
    { title: '操作', key: 'action', width: 100, render: () => (
      <Space>
        <Button type="text" size="small" icon={<Edit2 size={14} />} />
      </Space>
    )}
  ];

  const radarData = [
    { subject: '完整性', value: DATA_QUALITY.completeness, fullMark: 100 },
    { subject: '准确性', value: DATA_QUALITY.accuracy, fullMark: 100 },
    { subject: '一致性', value: DATA_QUALITY.consistency, fullMark: 100 },
    { subject: '时效性', value: DATA_QUALITY.timeliness, fullMark: 100 },
  ];

  return (
    <div style={{ padding: 24, background: COLORS.bg, minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: COLORS.text, margin: 0 }}>数据治理</Title>
        <Text style={{ color: COLORS.textMuted }}>数据标准化 · 质量管理 · 资产目录 · 安全分级</Text>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
        {
          key: 'overview',
          label: <span><Database size={14} /> 数据概览</span>,
          children: (
            <div>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}><Card style={{ borderRadius: 12, textAlign: 'center' }}>
                  <Statistic title="数据资产总数" value={ASSET_LIST.length} suffix="类" valueStyle={{ color: COLORS.primary }} />
                </Card></Col>
                <Col span={6}><Card style={{ borderRadius: 12, textAlign: 'center' }}>
                  <Statistic title="数据记录总量" value="6,246" valueStyle={{ color: COLORS.primary }} />
                </Card></Col>
                <Col span={6}><Card style={{ borderRadius: 12, textAlign: 'center' }}>
                  <Statistic title="数据字典项" value={DICT_ITEMS.length} valueStyle={{ color: COLORS.success }} />
                </Card></Col>
                <Col span={6}><Card style={{ borderRadius: 12, textAlign: 'center' }}>
                  <Statistic title="整体质量评分" value={DATA_QUALITY.overall} suffix="/100" valueStyle={{ color: DATA_QUALITY.overall > 90 ? COLORS.success : COLORS.warning }} />
                </Card></Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Card title="数据质量雷达" style={{ borderRadius: 12 }}>
                    <ResponsiveContainer width="100%" height={250}>
                      <RadarChart cx="50%" cy="50%" outerRadius="70%">
                        <PolarGrid stroke={COLORS.border} />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                        <Radar name="质量评分" dataKey="value" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 16 }}>
                      {[
                        { label: '完整性', value: DATA_QUALITY.completeness },
                        { label: '准确性', value: DATA_QUALITY.accuracy },
                        { label: '一致性', value: DATA_QUALITY.consistency },
                        { label: '时效性', value: DATA_QUALITY.timeliness },
                      ].map((item, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.primary }}>{item.value}%</div>
                          <div style={{ fontSize: 11, color: COLORS.textMuted }}>{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="数据安全等级分布" style={{ borderRadius: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {SECURITY_LEVELS.map((level, i) => {
                        const count = ASSET_LIST.filter(a => a.securityLevel === level.value).length;
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: level.color }} />
                            <span style={{ width: 60, fontSize: 13 }}>{level.label}</span>
                            <Progress percent={(count / ASSET_LIST.length) * 100} size="small" strokeColor={level.color} style={{ flex: 1 }} />
                            <span style={{ fontSize: 12, color: COLORS.textMuted, width: 40 }}>{count}个</span>
                          </div>
                        );
                      })}
                    </div>
                    <Divider />
                    <div style={{ fontSize: 12, color: COLORS.textMuted }}>
                      <Lock size={12} style={{ marginRight: 4 }} />机密数据需双重授权
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          )
        },
        {
          key: 'assets',
          label: <span><Database size={14} /> 数据资产目录</span>,
          children: (
            <Card style={{ borderRadius: 12 }}>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Text>共 {ASSET_LIST.length} 类数据资产</Text>
                <Space>
                  <Button icon={<FileSearch size={14} />}>导入</Button>
                  <Button type="primary" icon={<Plus size={14} />} onClick={() => setAssetModal(true)}>新增资产</Button>
                </Space>
              </div>
              <Table columns={assetColumns} dataSource={ASSET_LIST} rowKey="id" pagination={false} size="small" />
            </Card>
          )
        },
        {
          key: 'dict',
          label: <span><Setting size={14} /> 数据字典</span>,
          children: (
            <Card style={{ borderRadius: 12 }}>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Text>共 {DICT_ITEMS.length} 个字典项</Text>
                <Button type="primary" icon={<Plus size={14} />} onClick={() => setDictModal(true)}>新增字典</Button>
              </div>
              <Table columns={dictColumns} dataSource={DICT_ITEMS} rowKey="id" pagination={false} />
            </Card>
          )
        },
        {
          key: 'quality',
          label: <span><CheckCircle2 size={14} /> 质量规则</span>,
          children: (
            <Card style={{ borderRadius: 12 }}>
              <Title level={5}>数据质量检测规则</Title>
              <Row gutter={16} style={{ marginTop: 16 }}>
                {[
                  { rule: '完整性校验', desc: '必填字段不可为空', freq: '实时', status: 'active' },
                  { rule: '一致性校验', desc: '关联数据逻辑一致', freq: '每日', status: 'active' },
                  { rule: '准确性校验', desc: '数值范围合理', freq: '实时', status: 'active' },
                  { rule: '时效性校验', desc: '数据更新及时', freq: '每日', status: 'active' },
                  { rule: '唯一性校验', desc: '编码不重复', freq: '实时', status: 'active' },
                ].map((item, i) => (
                  <Col span={12} key={i} style={{ marginBottom: 16 }}>
                    <div style={{ padding: 16, background: COLORS.bg, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontWeight: 600 }}>{item.rule}</span>
                        <Badge status={item.status === 'active' ? 'success' : 'default'} text={item.status === 'active' ? '运行中' : '已停用'} />
                      </div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>{item.desc}</div>
                      <div style={{ fontSize: 11, color: COLORS.textMuted }}>检测频率: {item.freq}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          )
        },
      ]} />

      <Modal title="新增数据资产" open={assetModal} onCancel={() => setAssetModal(false)} footer={null} width={500}>
        <Form layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item label="资产名称" rules={[{ required: true }]}>
            <Input placeholder="请输入数据资产名称" />
          </Form.Item>
          <Form.Item label="资产分类">
            <Select placeholder="选择分类">
              <Select.Option value="业务数据">业务数据</Select.Option>
              <Select.Option value="财务数据">财务数据</Select.Option>
              <Select.Option value="系统数据">系统数据</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="数据安全等级">
            <Select placeholder="选择安全等级">
              {SECURITY_LEVELS.map(s => <Select.Option key={s.value} value={s.value}>{s.label} - {s.desc}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="所属部门">
            <Select placeholder="选择部门">
              <Select.Option value="项目管理部">项目管理部</Select.Option>
              <Select.Option value="质量安全部">质量安全部</Select.Option>
              <Select.Option value="财务部">财务部</Select.Option>
              <Select.Option value="信息中心">信息中心</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="更新频率">
            <Select placeholder="选择更新频率">
              <Select.Option value="实时">实时</Select.Option>
              <Select.Option value="每日">每日</Select.Option>
              <Select.Option value="低频">低频</Select.Option>
            </Select>
          </Form.Item>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button onClick={() => setAssetModal(false)}>取消</Button>
            <Button type="primary" onClick={() => { message.success('创建成功'); setAssetModal(false); }}>创建</Button>
          </div>
        </Form>
      </Modal>

      <Modal title="新增字典项" open={dictModal} onCancel={() => setDictModal(false)} footer={null} width={500}>
        <Form layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item label="字典编码" rules={[{ required: true }]}>
            <Input placeholder="如 PROJ_TYPE" style={{ fontFamily: 'monospace' }} />
          </Form.Item>
          <Form.Item label="字典名称" rules={[{ required: true }]}>
            <Input placeholder="请输入字典名称" />
          </Form.Item>
          <Form.Item label="所属分类">
            <Select placeholder="选择分类">
              <Select.Option value="项目管理">项目管理</Select.Option>
              <Select.Option value="安全管理">安全管理</Select.Option>
              <Select.Option value="数据治理">数据治理</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="选项值（逗号分隔）">
            <Input.TextArea rows={3} placeholder="选项1,选项2,选项3" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button onClick={() => setDictModal(false)}>取消</Button>
            <Button type="primary" onClick={() => { message.success('创建成功'); setDictModal(false); }}>创建</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
