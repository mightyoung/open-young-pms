import React, { useState, useMemo } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Select, DatePicker, Row, Col, Typography, Progress, Badge, Tooltip, Divider, message, Alert, List, Avatar, Statistic, Tabs, Collapse, Steps } from 'antd';
import { Plus, Edit2, FileText, Clock, Star, BarChart3, CheckCircle2, AlertTriangle, Download, Printer, Send, Eye, ClipboardList, Zap, User, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { generateReportContent, scoreReportQuality, REPORT_TEMPLATES } from '../utils/reportAutomation';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

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

const MOCK_REPORTS = [
  { id: 1, title: '2026-03-30 日报', type: 'daily', author: '张三', date: '2026-03-30', status: 'submitted', quality: 85, progress: 100 },
  { id: 2, title: '2026-03-24~03-30 周报', type: 'weekly', author: '李四', date: '2026-03-30', status: 'submitted', quality: 72, progress: 100 },
  { id: 3, title: '2026年3月月报', type: 'monthly', author: '王五', date: '2026-03-28', status: 'draft', quality: 45, progress: 60 },
  { id: 4, title: '安全专项报告_2026Q1', type: 'safety', author: '赵六', date: '2026-03-25', status: 'submitted', quality: 90, progress: 100 },
  { id: 5, title: '质量分析报告_2026-03', type: 'quality', author: '张三', date: '2026-03-26', status: 'submitted', quality: 68, progress: 100 },
  { id: 6, title: '项目进度汇报_产线改造', type: 'progress', author: '李四', date: '2026-03-20', status: 'submitted', quality: 78, progress: 100 },
];

const QUALITY_RADAR_DATA = [
  { subject: '完整性', score: 85 },
  { subject: '准确性', score: 72 },
  { subject: '及时性', score: 90 },
  { subject: '规范性', score: 68 },
  { subject: '洞察性', score: 55 },
];

const AUTO_REPORT_CONFIG = [
  { id: 'auto-1', name: '日报自动生成', type: 'daily', cron: '每天 18:00', enabled: true, lastRun: '2026-03-30 18:00' },
  { id: 'auto-2', name: '周报自动生成', type: 'weekly', cron: '每周五 17:00', enabled: true, lastRun: '2026-03-28 17:00' },
  { id: 'auto-3', name: '月报自动生成', type: 'monthly', cron: '每月最后一天 16:00', enabled: false, lastRun: '2026-02-28 16:00' },
];

export default function ReportManagementV2() {
  const [activeTab, setActiveTab] = useState('reports');
  const [showClipboardList, setShowTemplate] = useState(false);
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [previewReport, setPreviewReport] = useState(null);
  const [form] = Form.useForm();

  const stats = useMemo(() => ({
    total: MOCK_REPORTS.length,
    submitted: MOCK_REPORTS.filter(r => r.status === 'submitted').length,
    draft: MOCK_REPORTS.filter(r => r.status === 'draft').length,
    avgQuality: Math.round(MOCK_REPORTS.reduce((acc, r) => acc + r.quality, 0) / MOCK_REPORTS.length),
  }), []);

  const qualityChartData = QUALITY_RADAR_DATA;

  const columns = [
    { title: '报告名称', dataIndex: 'title', render: (v, r) => <Space><FileText size={14} color={COLORS.primary} />{v}</Space> },
    { title: '类型', dataIndex: 'type', width: 90, render: v => <Tag color={{ daily: 'blue', weekly: 'purple', monthly: 'orange', safety: 'red', quality: 'gold', progress: 'cyan' }[v] || 'default'}>{v}</Tag> },
    { title: '作者', dataIndex: 'author', width: 80 },
    { title: '日期', dataIndex: 'date', width: 110 },
    { title: '质量分', dataIndex: 'quality', width: 100, render: v => (
      <Space>
        <Progress percent={v} size="small" style={{ width: 60 }} strokeColor={v >= 80 ? COLORS.success : v >= 60 ? COLORS.warning : COLORS.danger} />
        <Tag color={v >= 80 ? 'success' : v >= 60 ? 'warning' : 'error'}>{v}</Tag>
      </Space>
    )},
    { title: '状态', dataIndex: 'status', width: 90, render: v => <Tag color={v === 'submitted' ? 'success' : 'default'}>{v === 'submitted' ? '已提交' : '草稿'}</Tag> },
    {
      title: '操作', width: 140, render: (_, r) => (
        <Space>
          <Button size="small" icon={<Eye size={12} />} onClick={() => setPreviewReport(r)}>预览</Button>
          <Button size="small" icon={<Download size={12} />}>导出</Button>
        </Space>
      )
    },
  ];

  const handleAutoGenerate = (type) => {
    const mockData = {
      tasks: MOCK_REPORTS.filter(r => r.type === type).map(r => ({ ...r, status: 'done' })),
      hazards: MOCK_REPORTS.filter(r => r.type === 'safety'),
      approvals: [],
    };
    const content = generateReportContent(type, { start: '2026-03-24', end: '2026-03-30' }, mockData);
    const quality = scoreReportQuality(content);
    message.success(`自动生成报告成功！质量评分：${quality}分`);
    setShowAutoModal(false);
  };

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', padding: '24px 28px' }}>
      <Card
        title={<Space><FileText size={16} color={COLORS.primary} /><span>报告中心 2.0</span></Space>}
        extra={<Space><Button icon={<ClipboardList size={14} />} onClick={() => setShowTemplate(true)}>模板市场</Button><Button type="primary" icon={<Zap size={14} />} onClick={() => setShowAutoModal(true)}>自动生成</Button></Space>}
        style={{ borderRadius: 12 }}
      >
        <Row gutter={16} style={{ marginBottom: 24 }}>
          {[
            { label: '报告总数', value: stats.total, icon: <FileText size={20} />, color: COLORS.primary },
            { label: '已提交', value: stats.submitted, icon: <CheckCircle2 size={20} />, color: COLORS.success },
            { label: '草稿', value: stats.draft, icon: <Edit2 size={20} />, color: COLORS.warning },
            { label: '平均质量', value: `${stats.avgQuality}分`, icon: <Star size={20} />, color: stats.avgQuality >= 75 ? COLORS.success : COLORS.danger },
          ].map(s => (
            <Col span={6} key={s.label}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <div style={{ color: s.color, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>{s.label}</div>
              </Card>
            </Col>
          ))}
        </Row>

        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          { key: 'reports', label: '全部报告' },
          { key: 'auto', label: '自动报告' },
          { key: 'quality', label: '质量分析' },
        ]} />

        {activeTab === 'reports' && (
          <Table dataSource={MOCK_REPORTS} columns={columns} rowKey="id" pagination={{ pageSize: 8 }} />
        )}

        {activeTab === 'auto' && (
          <div>
            <Alert
              message="阶梯自动化"
              description="配置日/周/月报的自动生成规则，系统将在指定时间自动汇总数据并生成报告初稿，您只需审核后提交。"
              type="info"
              style={{ marginBottom: 16 }}
            />
            <List
              dataSource={AUTO_REPORT_CONFIG}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button size="small" type="primary" icon={<Zap size={12} />} onClick={() => handleAutoGenerate(item.type)}>立即生成</Button>,
                    <Button size="small" icon={item.enabled ? '暂停' : '启用'}>{item.enabled ? '暂停' : '启用'}</Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<div style={{ width: 40, height: 40, borderRadius: 8, background: `${COLORS.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={18} color={COLORS.primary} /></div>}
                    title={<Space>{item.name}<Tag color={item.enabled ? 'success' : 'default'}>{item.enabled ? '已启用' : '已暂停'}</Tag></Space>}
                    description={<Space><Clock size={12} /><Text type="secondary">{item.cron}</Text><Text type="secondary" style={{ marginLeft: 16 }}>上次运行：{item.lastRun}</Text></Space>}
                  />
                </List.Item>
              )}
            />
          </div>
        )}

        {activeTab === 'quality' && (
          <Row gutter={24}>
            <Col span={12}>
              <Card size="small" title="报告质量雷达">
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={qualityChartData}>
                    <PolarGrid stroke={COLORS.border} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                    <Radar name="质量评分" dataKey="score" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="质量改进建议">
                {[
                  { label: '完整性', tip: '建议增加数据来源说明和附录部分', score: 85 },
                  { label: '准确性', tip: '建议增加数据校验和交叉核实环节', score: 72 },
                  { label: '及时性', tip: '继续保持，目前表现优秀', score: 90 },
                  { label: '规范性', tip: '建议使用统一模板，注意格式规范', score: 68 },
                  { label: '洞察性', tip: '建议增加同比/环比分析和趋势预判', score: 55 },
                ].map(item => (
                  <div key={item.label} style={{ padding: '8px 0', borderBottom: `1px solid ${COLORS.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text>{item.label}</Text>
                      <Tag color={item.score >= 80 ? 'success' : item.score >= 60 ? 'warning' : 'error'}>{item.score}分</Tag>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.tip}</Text>
                  </div>
                ))}
              </Card>
            </Col>
          </Row>
        )}
      </Card>

      <Modal
        title="报告模板市场"
        open={showTemplate}
        onCancel={() => setShowTemplate(false)}
        footer={<Button onClick={() => setShowTemplate(false)}>关闭</Button>}
        width={700}
      >
        <Row gutter={[16, 16]}>
          {REPORT_TEMPLATES.map(t => (
            <Col span={12} key={t.id}>
              <Card size="small" hoverable style={{ border: `1px solid ${COLORS.border}`, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Space>
                    <Template size={16} color={COLORS.primary} />
                    <Text strong>{t.name}</Text>
                  </Space>
                  <Tag>{t.type}</Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>{t.desc}</Text>
                <div style={{ marginTop: 12 }}>
                  <Button type="primary" size="small" icon={<FileText size={12} />} block>使用模板</Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>

      <Modal
        title={<Space><Zap size={16} color={COLORS.primary} />自动生成报告</Space>}
        open={showAutoModal}
        onCancel={() => setShowAutoModal(false)}
        footer={null}
        width={500}
      >
        <Alert message="系统将根据已配置的报告模板和数据，自动生成报告初稿" type="info" style={{ marginBottom: 16 }} />
        <Row gutter={[12, 12]}>
          {REPORT_TEMPLATES.slice(0, 3).map(t => (
            <Col span={8} key={t.id}>
              <Card size="small" hoverable onClick={() => handleAutoGenerate(t.type)} style={{ textAlign: 'center', cursor: 'pointer', borderRadius: 8 }}>
                <FileText size={24} color={COLORS.primary} />
                <div style={{ marginTop: 8, fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                <div style={{ marginTop: 4, fontSize: 11, color: COLORS.textMuted }}>{t.type}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal>

      <Modal
        title={<Space><Eye size={16} />报告预览</Space>}
        open={!!previewReport}
        onCancel={() => setPreviewReport(null)}
        footer={<Space><Button onClick={() => setPreviewReport(null)}>关闭</Button><Button type="primary" icon={<Send size={14} />}>提交报告</Button></Space>}
        width={700}
      >
        {previewReport && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Title level={4}>{previewReport.title}</Title>
              <Space>
                <Tag><User size={12} /> {previewReport.author}</Tag>
                <Tag><Calendar size={12} /> {previewReport.date}</Tag>
                <Tag color={previewReport.quality >= 80 ? 'success' : previewReport.quality >= 60 ? 'warning' : 'error'}>
                  <Star size={12} /> {previewReport.quality}分
                </Tag>
              </Space>
            </div>
            <Divider />
            <pre style={{ background: COLORS.bg, padding: 16, borderRadius: 8, fontSize: 13, lineHeight: 1.8, maxHeight: 400, overflow: 'auto' }}>
              {generateReportContent(previewReport.type, { start: previewReport.date, end: previewReport.date }, {
                tasks: MOCK_REPORTS.filter(r => r.type === previewReport.type).map(r => ({ ...r, status: 'done' })),
                hazards: MOCK_REPORTS.filter(r => r.type === 'safety'),
                approvals: [],
              })}
            </pre>
          </div>
        )}
      </Modal>
    </div>
  );
}
