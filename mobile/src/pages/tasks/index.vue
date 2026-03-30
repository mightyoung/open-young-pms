<template>
  <view class="tasks-page">
    <view class="filter-tabs">
      <view 
        v-for="tab in tabs" 
        :key="tab.value"
        :class="['tab', { active: currentTab === tab.value }]"
        @click="currentTab = tab.value"
      >{{ tab.label }}</view>
    </view>
    <EmptyState v-if="tasks.length === 0" icon="📋" message="暂无任务" />
    <TaskCard v-else v-for="task in tasks" :key="task.id" :task="task" @click="goDetail" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import TaskCard from '@/components/TaskCard.vue'

const tabs = [
  { label: '全部', value: 'all' },
  { label: '待开始', value: 'pending' },
  { label: '进行中', value: 'processing' },
  { label: '已完成', value: 'done' }
]

const currentTab = ref('all')
const tasks = ref<any[]>([])

function goDetail(task: any) {
  console.log('task detail:', task)
}
</script>

<style lang="scss" scoped>
.tasks-page {
  padding: 20rpx;
}

.filter-tabs {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;

  .tab {
    padding: 12rpx 32rpx;
    border-radius: 32rpx;
    background: #fff;
    color: #666;
    font-size: 26rpx;

    &.active {
      background: #1890ff;
      color: #fff;
    }
  }
}
</style>
