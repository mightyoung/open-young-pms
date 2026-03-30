/**
 * Report automation: daily/weekly/monthly generation, quality scoring
 */

export function generateReportContent(type, dateRange, data) {
  const { tasks = [], hazards = [], approvals = [] } = data;
  switch (type) {
    case 'daily':
      return generateDailyReport(dateRange, { tasks, hazards, approvals });
    case 'weekly':
      return generateWeeklyReport(dateRange, { tasks, hazards, approvals });
    case 'monthly':
      return generateMonthlyReport(dateRange, { tasks, hazards, approvals });
    default:
      return '';
  }
}

function generateDailyReport(range, data) {
  const { tasks, hazards } = data;
  const completed = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'inprogress').length;
  const newHazards = hazards.length;
  return `【日报】${range.start}至${range.end}\n\n一、任务概况\n- 完成：${completed}项\n- 进行中：${inProgress}项\n\n二、安全隐患\n- 新增隐患：${newHazards}起\n\n三、明日计划\n1. 继续推进当前任务\n2. 关注安全隐患整改`;
}

function generateWeeklyReport(range, data) {
  const { tasks, hazards } = data;
  const completed = tasks.filter(t => t.status === 'done').length;
  const total = tasks.length;
  return `【周报】${range.start}至${range.end}\n\n一、任务进度\n- 本周完成：${completed}/${total}项\n- 完成率：${total > 0 ? Math.round((completed / total) * 100) : 0}%\n\n二、安全管理\n- 本周隐患：${hazards.length}起\n- 整改完成：${hazards.filter(h => h.status === 'closed').length}起\n\n三、下周计划\n1. 加快关键路径任务\n2. 强化现场安全管理`;
}

function generateMonthlyReport(range, data) {
  const { tasks, hazards, approvals } = data;
  return `【月报】${range.start}至${range.end}\n\n一、整体情况\n- 任务完成率：${tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0}%\n- 隐患整改率：${hazards.length > 0 ? Math.round((hazards.filter(h => h.status === 'closed').length / hazards.length) * 100) : 0}%\n- 审批通过率：${approvals.length > 0 ? Math.round((approvals.filter(a => a.status === 'approved').length / approvals.length) * 100) : 0}%\n\n二、主要成果\n三、存在问题\n四、改进措施`;
}

export function scoreReportQuality(content) {
  if (!content) return 0;
  let score = 0;
  if (content.length > 200) score += 25;
  if (content.includes('一、') && content.includes('二、') && content.includes('三、')) score += 30;
  if (content.includes('\n') && content.split('\n').length > 5) score += 20;
  if (/\d+/.test(content)) score += 15;
  if (content.includes('同比') || content.includes('环比') || content.includes('计划')) score += 10;
  return Math.min(100, score);
}

export const REPORT_TEMPLATES = [
  { id: 'daily', name: '日报模板', type: 'daily', desc: '日常工作任务汇报' },
  { id: 'weekly', name: '周报模板', type: 'weekly', desc: '本周工作汇总与计划' },
  { id: 'monthly', name: '月报模板', type: 'monthly', desc: '月度工作总结' },
  { id: 'safety', name: '安全专项报告', type: 'safety', desc: '安全隐患排查与整改' },
  { id: 'quality', name: '质量分析报告', type: 'quality', desc: '质量问题的分析与改进' },
  { id: 'progress', name: '进度汇报', type: 'progress', desc: '项目进度专项汇报' },
];
