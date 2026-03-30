<template>
  <view class="task-card" @click="onClick">
    <view class="card-header">
      <text class="task-name">{{ task.name }}</text>
      <view class="priority-badge" :class="task.priority">{{ priorityLabel }}</view>
    </view>
    <view class="card-body">
      <text class="project-name">{{ task.projectName }}</text>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: task.progress + '%' }" />
      </view>
      <text class="progress-text">{{ task.progress }}%</text>
    </view>
    <view class="card-footer">
      <text class="deadline" :class="{ overdue: isOverdue }">
        📅 {{ task.deadline }}
      </text>
      <text class="assignee">{{ task.assigneeName }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Task {
  id: string
  name: string
  projectName: string
  priority: 'low' | 'medium' | 'high'
  progress: number
  deadline: string
  assigneeName: string
}

const props = defineProps<{ task: Task }>()
const emit = defineEmits(['click'])

const priorityMap = {
  low: { label: '低', class: 'low' },
  medium: { label: '中', class: 'medium' },
  high: { label: '高', class: 'high' }
}

const priorityLabel = computed(() => priorityMap[props.task.priority]?.label)
const isOverdue = computed(() => new Date(props.task.deadline) < new Date())

function onClick() {
  emit('click', props.task)
}
</script>

<style lang="scss" scoped>
.task-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
  }

  .task-name {
    font-weight: 600;
    font-size: 30rpx;
    color: #333;
    flex: 1;
  }

  .priority-badge {
    padding: 4rpx 16rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    color: #fff;

    &.low { background: #52c41a; }
    &.medium { background: #faad14; }
    &.high { background: #ff4d4f; }
  }

  .card-body {
    margin-bottom: 16rpx;
  }

  .project-name {
    color: #666;
    font-size: 26rpx;
    margin-bottom: 12rpx;
    display: block;
  }

  .progress-bar {
    height: 8rpx;
    background: #e5e5e5;
    border-radius: 4rpx;
    margin-bottom: 8rpx;
  }

  .progress-fill {
    height: 100%;
    background: #1890ff;
    border-radius: 4rpx;
    transition: width 0.3s;
  }

  .progress-text {
    color: #1890ff;
    font-size: 24rpx;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .deadline {
    color: #666;
    font-size: 24rpx;

    &.overdue { color: #ff4d4f; }
  }

  .assignee {
    color: #999;
    font-size: 24rpx;
  }
}
</style>
