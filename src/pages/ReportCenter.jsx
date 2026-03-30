import React, { useState, useMemo } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Form, Select, DatePicker, Row, Col, Typography, Progress, Badge, message, Tabs, Statistic, Divider, Steps, Avatar, Skeleton } from 'antd';
import { Plus, FileText, CheckCircle2, Clock, User, Calendar, Download, Printer, Send, Edit2, Eye } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { measureText } from '../utils/pretextMeasure';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

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

const REPORT_TYPES = [
  { value: 'daily', label: '日报', color: COLORS.primary },
  { value: 'weekly', label: '周报', color: COLORS.success },
  { value: 'monthly', label: '月报', color: COLORS.warning },
];

const MOCK_REPORTS = [
  { id: 1, title: '产线自动化改造项目 - 第12周周报', type: 'weekly', project: '产线自动化改造项目', author: '张经理', submitTime: '2026-03-28 17:00', status: 'approved', progress: 78, issues: 2, milestone: '详细设计阶段完成' },
  { id: 2, title: '新厂房建设项目 - 3月月报', type: 'monthly', project: '新厂房建设项目', author: '李经理', submitTime: '2026-03-25 17:00', status: 'approved', progress: 95, issues: 0, milestone: '主体结构封顶' },
  { id: 3, title: 'XX集团设备安装工程 - 第12周周报', type: 'weekly', project: 'XX集团设备安装工程', author: '王经理', submitTime: '2026-03-28 16:30', status: 'pending', progress: 62, issues: 3, milestone: '设备安装中' },
  { id: 4, title: '检测设备采购项目 - 第12周周报', type: 'weekly', project: '检测设备采购项目', author: '刘经理', submitTime: '2026-03-29 09:00', status: 'rejected', progress: 35, issues: 5, milestone: '等待设备到货' },
  { id: 5, title: '研发中心升级项目 - 3月月报', type: 'monthly', project: '研发中心升级项目', author: '陈经理', submitTime: '2026-03-26 17:00', status: 'approved', progress: 88, issues: 1, milestone: '研发环境部署完成' },
  { id: 6, title: '产线自动化改造项目 - 第11周周报', type: 'weekly', project: '产线自动化改造项目', author: '张经理', submitTime: '2026-03-21 17:00', status: 'approved', progress: 75, issues: 2, milestone: '方案评审' },
];

const STATISTICS = {
  total: 156,
  submitted: 89,
  pending: 12,
  approved: 72,
  rejected: 5,
  onTimeRate: 94,
};

const TREND_DATA = [
  { week: 'W1', daily: 12, weekly: 4, monthly: 1 },
  { week: 'W2', daily: 15, weekly: 5, monthly: 1 },
  { week: 'W3', daily: 18, weekly: 5, monthly: 1 },
  { week: 'W4', daily: 20, weekly: 6, monthly: 2 },
  { week: 'W5', daily: 22, weekly: 5, monthly: 1 },
  { week: 'W6', daily: 25, weekly: 6, monthly: 2 },
];

const APPROVAL_STATUS = [
  { name: '已通过', value: 72, color: COLORS.success },
  { name: '待审批', value: 12, color: COLORS.warning },
  { name: '已驳回', value: 5, color: COLORS.danger },
];

export default function ReportCenter() {
  const [reports] = useState(MOCK_REPORTS);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [previewReport, setPreviewReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const filteredReports = reports.filter(r => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  // Pretext: pre-compute text heights for virtual scrolling optimization
  const reportTextMetrics = useMemo(() => {
    return filteredReports.map(report => {
      const titleMetrics = measureText(report.title, '500 14px Inter, sans-serif', 280);
      const milestoneMetrics = measureText(report.milestone, '14px Inter, sans-serif', 140);
      return {
        id: report.id,
        titleHeight: titleMetrics.height,
        milestoneHeight: milestoneMetrics.height,
        estimatedRowHeight: Math.max(titleMetrics.height, 24) + milestoneMetrics.height + 60,
      };
    });
  }, [filteredReports]);

  const getStatusBadge = (status) => {
    const map = {
      approved: { color: 'success', text: '已通过' },
      pending: { color: 'processing', text: '待审批' },
      rejected: { color: 'error', text: '已驳回' },
    };
    const { color, text } = map[status] || { color: 'default', text: status };
    return <Badge status={color} text={text} />;
  };

  const getTypeBadge = (type) => {
    const t = REPORT_TYPES.find(t => t.value === type);
    return <Tag color={t?.color}>{t?.label}</Tag>;
  };

  const handleSubmitReport = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setModalVisible(false);
      message.success('报告提交成功！');
    }, 1000);
  };

  const handleApprove = (record) => {
    message.success(`报告「${record.title}」已通过审批`);
  };

  const handleReject = (record) => {
    message.error(`报告「${record.title}」已被驳回`);
  };

  const columns = [
    { title: '报告标题', dataIndex: 'title', key: 'title', width: 300,
      render: (text, record) => {
        const metrics = reportTextMetrics.find(m => m.id === record.id);
        return (
          <Space>
            {getTypeBadge(record.type)}
            <span style={{ fontWeight: 500, lineHeight: 1.4 }}>{text}</span>
          </Space>
        );
      }
    },
    { title: '项目', dataIndex: 'project', key: 'project', width: 150 },
    { title: '提交人', dataIndex: 'author', key: 'author', width: 100 },
    { title: '提交时间', dataIndex: 'submitTime', key: 'submitTime', width: 150 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: getStatusBadge },
    { title: '完成进度', dataIndex: 'progress', key: 'progress', width: 120,
      render: (v) => <Progress percent={v} size="small" strokeColor={COLORS.primary} />
    },
    { title: '里程碑', dataIndex: 'milestone', key: 'milestone', width: 150 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="text" size="small" icon={<Eye size={14} />} onClick={() => setPreviewReport(record)}>查看</Button>
          <Button type="text" size="small" icon={<CheckCircle2 size={14} />} onClick={() => handleApprove(record)} style={{ color: COLORS.success }} />
          <Button type="text" size="small" icon={<Edit2 size={14} />} onClick={() => handleReject(record)} style={{ color: COLORS.danger }} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: COLORS.bg, minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: COLORS.text, margin: 0 }}>报告中心</Title>
        <Text style={{ color: COLORS.textMuted }}>日报 · 周报 · 月报 阶梯自动化管理</Text>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}><Card style={{ borderRadius: 12, textAlign: 'center' }}>
          <Statistic title="本年报告" value={STATISTICS.total} valueStyle={{ color: COLORS.primary }} />
        </Card></Col>
        <Col span={4}><Card style={{ borderRadius: 12, textAlign: 'center' }}>
          <Statistic title="已提交" value={STATISTICS.submitted} valueStyle={{ color: COLORS.success }} />
        </Card></Col>
        <Col span={4}><Card style={{ borderRadius: 12, textAlign: 'center' }}>
          <Statistic title="待审批" value={STATISTICS.pending} valueStyle={{ color: COLORS.warning }} />
        </Card></Col>
        <Col span={4}><Card style={{ borderRadius: 12, textAlign: 'center' }}>
          <Statistic title="已通过" value={STATISTICS.approved} valueStyle={{ color: COLORS.success }} />
        </Card></Col>
        <Col span={4}><Card style={{ borderRadius: 12, textAlign: 'center' }}>
          <Statistic title="按时提交率" value={STATISTICS.onTimeRate + '%'} valueStyle={{ color: COLORS.success }} suffix="%" />
        </Card></Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Card title="报告提交趋势" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Bar dataKey="daily" fill={COLORS.primary} name="日报" radius={[4, 4, 0, 0]} />
                <Bar dataKey="weekly" fill={COLORS.success} name="周报" radius={[4, 4, 0, 0]} />
                <Bar dataKey="monthly" fill={COLORS.warning} name="月报" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="审批状态分布" style={{ borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ResponsiveContainer width="50%" height={150}>
                <PieChart>
                  <Pie data={APPROVAL_STATUS} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value">
                    {APPROVAL_STATUS.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {APPROVAL_STATUS.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color }} />
                    <span style={{ fontSize: 12, color: COLORS.text }}>{s.name}</span>
                    <span style={{ fontSize: 12, color: COLORS.textMuted, marginLeft: 'auto' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12 }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Tabs 
              activeKey={typeFilter} 
              onChange={setTypeFilter}
              items={[
                { key: 'all', label: '全部' },
                { key: 'daily', label: '日报' },
                { key: 'weekly', label: '周报' },
                { key: 'monthly', label: '月报' },
              ]}
            />
          </Space>
          <Space>
            <Select placeholder="状态筛选" style={{ width: 120 }} value={statusFilter} onChange={setStatusFilter}>
              <Select.Option value="all">全部状态</Select.Option>
              <Select.Option value="approved">已通过</Select.Option>
              <Select.Option value="pending">待审批</Select.Option>
              <Select.Option value="rejected">已驳回</Select.Option>
            </Select>
            <Button icon={<Download size={14} />}>导出</Button>
            <Button type="primary" icon={<Plus size={14} />} onClick={() => setModalVisible(true)}>新建报告</Button>
          </Space>
        </div>
        <Table 
          columns={columns} 
          dataSource={filteredReports} 
          rowKey="id" 
          pagination={{ pageSize: 8 }}
          rowClassName={() => 'report-row'}
        />
      </Card>

      <Modal
        title="新建报告"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
        maskClosable={false}
      >
        <Form layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item label="报告类型">
            <Tabs items={REPORT_TYPES.map(t => ({ key: t.value, label: t.label }))} />
          </Form.Item>
          <Form.Item label="关联项目" name="project" rules={[{ required: true, message: '请选择项目' }]}>
            <Select placeholder="选择项目">
              <Select.Option value="1">产线自动化改造项目</Select.Option>
              <Select.Option value="2">新厂房建设项目</Select.Option>
              <Select.Option value="3">XX集团设备安装工程</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="报告周期" name="dateRange" rules={[{ required: true, message: '请选择报告周期' }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="完成情况">
            <Steps current={1} items={[
              { title: '已完成', description: '本周工作' },
              { title: '进行中', description: '正在进行' },
              { title: '待开始', description: '下周计划' },
            ]} />
          </Form.Item>
          <Form.Item label="问题与风险" name="issues" rules={[{ required: true, message: '请填写问题与风险' }]}>
            <textarea style={{ width: '100%', minHeight: 80, borderRadius: 8, border: '1px solid #e5e7eb', padding: 8 }} placeholder="描述本周遇到的问题..." />
          </Form.Item>
          <Form.Item label="里程碑进展" name="milestone" rules={[{ required: true, message: '请填写里程碑进展' }]}>
            <textarea style={{ width: '100%', minHeight: 80, borderRadius: 8, border: '1px solid #e5e7eb', padding: 8 }} placeholder="描述里程碑进展..." />
          </Form.Item>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button onClick={() => setModalVisible(false)}>取消</Button>
            <Button type="primary" icon={<Send size={14} />} onClick={handleSubmitReport} loading={loading}>提交审批</Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title={previewReport?.title}
        open={!!previewReport}
        onCancel={() => setPreviewReport(null)}
        footer={null}
        width={800}
        destroyOnClose
      >
        {previewReport && (
          <div>
            <Card style={{ background: COLORS.bg, marginBottom: 16 }}>
              <Row gutter={24}>
                <Col span={8}>
                  <div style={{ fontSize: 12, color: COLORS.textMuted }}>项目</div>
                  <div style={{ fontWeight: 500 }}>{previewReport.project}</div>
                </Col>
                <Col span={8}>
                  <div style={{ fontSize: 12, color: COLORS.textMuted }}>提交人</div>
                  <div style={{ fontWeight: 500 }}>{previewReport.author}</div>
                </Col>
                <Col span={8}>
                  <div style={{ fontSize: 12, color: COLORS.textMuted }}>状态</div>
                  <div>{getStatusBadge(previewReport.status)}</div>
                </Col>
              </Row>
            </Card>
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>完成进度</Text>
              <Progress percent={previewReport.progress} strokeColor={COLORS.primary} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>里程碑</Text>
              <Tag color="blue">{previewReport.milestone}</Tag>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>发现问题</Text>
              <Tag color={previewReport.issues > 3 ? 'red' : previewReport.issues > 0 ? 'orange' : 'green'}>
                {previewReport.issues} 个问题
              </Tag>
            </div>
            <Divider />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button icon={<Printer size={14} />}>打印</Button>
              <Button icon={<Download size={14} />}>导出</Button>
              {previewReport.status === 'pending' && (
                <>
                  <Button style={{ color: COLORS.danger }} onClick={() => { setPreviewReport(null); message.error('报告已驳回'); }}>驳回</Button>
                  <Button type="primary" icon={<CheckCircle2 size={14} />} onClick={() => { setPreviewReport(null); message.success('报告已通过！'); }}>通过</Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
