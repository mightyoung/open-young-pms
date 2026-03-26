# PMS-UI: Dribbble级项目管理界面

## 项目位置
/Users/muyi/clawd/workspace/autonomous/pms-template/

## 技术栈
- React 18 + Vite
- Ant Design 5（深色主题）
- Framer Motion 11
- Recharts
- Lucide React（图标）
- Tailwind CSS（辅助）

## 设计规范
- 主背景: #0a0a0e
- 卡片背景: #1a1a22
- 容器背景: #13131a
- 强调色: #6366f1（靛蓝紫）
- 成功色: #22c55e
- 警告色: #f59e0b
- 危险色: #ef4444
- 字体: Inter（Google Fonts fallback到系统字体）
- 圆角: 14px（卡片）、18px（大组件）
- 边框: 1px solid rgba(255,255,255,0.06)

## 页面结构

### 1. 侧边栏（可折叠）
- Logo: ProjectX（渐变图标 + 文字）
- 菜单项: 仪表盘/看板/团队/文档（带图标）
- 当前选中态: 左侧2px accent色条 + 背景渐变
- 底部: 用户信息（头像+名字+角色）

### 2. 顶栏
- 汉堡菜单（控制侧边栏折叠）
- 搜索框（带Search图标）
- 操作按钮: 刷新、筛选、通知铃铛（带Badge）
- 头像下拉菜单

### 3. 仪表盘页面
#### 统计卡片 x4（悬停上浮2px + 边框变亮）
- 总任务: 14个，趋势+12%
- 进行中: 3个，趋势-5%
- 已完成: 5个，趋势+25%
- 团队成员: 4人

#### 图表区（2行）
- 行1: 面积图(14列) + 柱状图(10列)
- 行2: 环形图(8列) + 活动列表(5条)
- 图表使用Recharts，主题色与设计系统一致

### 4. 看板页面
#### 四列: 待办(灰)/进行中(紫)/评审(橙)/完成(绿)
每列:
- 列头: 彩色圆点 + 名称 + 计数badge + 添加按钮
- 卡片列表（AnimatePresence）
- 空状态提示

#### 任务卡片（悬停scale(1.02)+阴影+右上角操作按钮）
- 左侧优先级色条（高红/中橙/低紫）
- 标签: 优先级badge + 类型tag
- 标题: 14px 600
- 进度条（进行中有，其他无）
- 底部: 图标区(评论/附件/故事点) + 日期 + 负责人头像

### 5. 任务详情弹窗（720px居中）
- 顶部4px渐变色条
- 标签行: 优先级 + 类型
- 标题（h3 20px）
- 三个Tab: 详情/评论/活动

#### 详情Tab
- 左16列: 描述 + 子任务列表（带动画）
- 右8列: 负责人/截止/故事点/进度

#### 评论Tab
- 评论列表（带头像、时间、内容）
- 输入框（带发送按钮）

## 动画规格
- 页面切换: opacity+y, 300ms
- 卡片进入: scale(0.94→1)+opacity, stagger 60ms
- 悬停: scale(1.02)+shadow, 250ms cubic-bezier
- 进度条: width动画 800ms
- 弹窗: scale(0.96→1)+opacity, 300ms spring

## 组件结构
src/
  App.jsx          # 主布局 + 路由状态
  components/
    Charts.jsx     # Area/Bar/Donut图表
    Icons.jsx      # 所有图标组件（SVG inline）
    Sidebar.jsx    # 侧边栏
    Header.jsx     # 顶栏
    StatCard.jsx   # 统计卡片
    TaskCard.jsx   # 任务卡片
    KanbanBoard.jsx # 看板
    TaskModal.jsx   # 任务详情弹窗
  main.jsx
  index.css        # 全局样式 + 字体导入
  data.js          # 模拟数据

## 模拟数据
- 4个用户: 张小明(前端,紫), 李华(后端,绿), 王芳(UI,粉), 赵强(测试,橙)
- 任务14条，分布在4列
- 活动5条，评论3条，子任务4条

## 输出要求
1. 所有文件写完后，执行: cd /Users/muyi/clawd/workspace/autonomous/pms-template && npm install && echo "安装完成"
2. package.json 包含所有依赖
3. 确保 npm install 成功
4. 输出最终的 npm run dev 启动命令
