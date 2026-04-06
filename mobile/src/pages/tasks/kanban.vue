<template>
  <view class="kanban-container">
    <scroll-view class="kanban-swiper" scroll-x enable-flex>
      <view v-for="column in columns" :key="column.id" class="kanban-column">
        <view class="column-header">
          <text class="column-title">{{ column.title }}</text>
          <text class="column-count">{{ column.tasks.length }}</text>
        </view>
        
        <scroll-view class="task-list" scroll-y>
          <view 
            v-for="task in column.tasks" 
            :key="task.id" 
            class="task-card"
            @click="goDetail(task)"
          >
            <view class="task-top">
              <text class="task-name">{{ task.title }}</text>
              <view class="priority-dot" :class="task.priority"></view>
            </view>
            <view class="task-meta">
              <text class="assignee">👤 {{ task.assignee?.full_name || '未指派' }}</text>
              <text class="date">📅 {{ formatDate(task.planned_end) }}</text>
            </view>
            <view class="task-progress">
              <progress :percent="task.progress" stroke-width="3" border-radius="3" activeColor="#1890ff" />
            </view>
          </view>
          
          <view v-if="column.tasks.length === 0" class="empty-placeholder">
            暂无任务
          </view>
        </scroll-view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/api'

const columns = ref([
  { id: 'pending', title: '待开始', tasks: [] },
  { id: 'in_progress', title: '进行中', tasks: [] },
  { id: 'completed', title: '已完成', tasks: [] }
])

onMounted(() => {
  fetchKanbanData()
})

async function fetchKanbanData() {
  try {
    // 假设我们有一个默认项目 ID，或从上级页面传入
    const projectId = 'demo-project-id' 
    const res = await api.tasks.kanban(projectId)
    
    columns.value[0].tasks = res.columns.pending.tasks
    columns.value[1].tasks = res.columns.in_progress.tasks
    columns.value[2].tasks = res.columns.completed.tasks
  } catch (e) {
    console.error('Fetch kanban failed:', e)
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return dateStr.split('T')[0].slice(5)
}

function goDetail(task: any) {
  uni.navigateTo({ url: `/pages/tasks/detail?id=${task.id}` })
}
</script>

<style lang="scss" scoped>
.kanban-container {
  height: 100vh;
  background: #f0f2f5;
}

.kanban-swiper {
  height: 100%;
  display: flex;
  padding: 20rpx;
  box-sizing: border-box;
}

.kanban-column {
  flex-shrink: 0;
  width: 600rpx;
  background: #ebecf0;
  border-radius: 16rpx;
  margin-right: 20rpx;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 40rpx);
}

.column-header {
  padding: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .column-title {
    font-weight: 700;
    color: #172b4d;
    font-size: 30rpx;
  }
  
  .column-count {
    background: rgba(9, 30, 66, 0.08);
    padding: 4rpx 12rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    color: #5e6c84;
  }
}

.task-list {
  flex: 1;
  padding: 0 16rpx 16rpx;
  box-sizing: border-box;
}

.task-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.05);
  
  .task-top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16rpx;
  }
  
  .task-name {
    font-size: 28rpx;
    color: #172b4d;
    font-weight: 500;
    flex: 1;
  }
  
  .priority-dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    margin-left: 12rpx;
    &.high { background: #ff4d4f; }
    &.medium { background: #faad14; }
    &.low { background: #52c41a; }
  }
}

.task-meta {
  display: flex;
  gap: 20rpx;
  margin-bottom: 16rpx;
  font-size: 22rpx;
  color: #5e6c84;
}

.empty-placeholder {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 26rpx;
}
</style>
