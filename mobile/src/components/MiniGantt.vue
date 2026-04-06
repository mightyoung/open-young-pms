<template>
  <view class="mini-gantt">
    <view class="timeline-header">
      <view v-for="day in days" :key="day" class="day-label">
        {{ day }}
      </view>
    </view>
    
    <scroll-view scroll-y class="task-rows">
      <view v-for="task in tasks" :key="task.id" class="task-row">
        <view class="task-info">
          <text class="task-name">{{ task.title }}</text>
        </view>
        <view class="bar-container">
          <view 
            class="task-bar" 
            :style="{ 
              left: calculateLeft(task.planned_start) + 'px', 
              width: calculateWidth(task.planned_start, task.planned_end) + 'px',
              background: task.status === 'completed' ? '#52c41a' : '#1890ff'
            }"
          >
            <text class="progress-text" v-if="calculateWidth(task.planned_start, task.planned_end) > 40">
              {{ task.progress }}%
            </text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  tasks: any[]
}>()

const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const DAY_WIDTH = 60 // 每个单元格宽度

function calculateLeft(startStr: string) {
  if (!startStr) return 0
  const date = new Date(startStr)
  const day = date.getDay() || 7 // 1-7
  return (day - 1) * DAY_WIDTH
}

function calculateWidth(startStr: string, endStr: string) {
  if (!startStr || !endStr) return 40
  const start = new Date(startStr).getTime()
  const end = new Date(endStr).getTime()
  const duration = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
  return duration * DAY_WIDTH
}
</script>

<style lang="scss" scoped>
.mini-gantt {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  border: 1rpx solid #eee;
}

.timeline-header {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1rpx solid #eee;
  padding-left: 160rpx;
  
  .day-label {
    width: 120rpx; // 对应 60px
    flex-shrink: 0;
    text-align: center;
    font-size: 22rpx;
    color: #999;
    padding: 16rpx 0;
  }
}

.task-rows {
  max-height: 400rpx;
}

.task-row {
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #f5f5f5;
  height: 80rpx;
}

.task-info {
  width: 160rpx;
  flex-shrink: 0;
  padding: 0 16rpx;
  box-sizing: border-box;
  
  .task-name {
    font-size: 24rpx;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.bar-container {
  flex: 1;
  position: relative;
  height: 100%;
}

.task-bar {
  position: absolute;
  top: 20rpx;
  height: 40rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .progress-text {
    color: #fff;
    font-size: 18rpx;
    font-weight: 700;
  }
}
</style>
