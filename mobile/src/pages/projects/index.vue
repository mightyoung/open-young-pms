<template>
  <view class="projects-page">
    <EmptyState v-if="projects.length === 0" icon="📁" message="暂无项目" />
    <view v-else class="project-list">
      <view v-for="project in projects" :key="project.id" class="project-item" @click="goDetail(project)">
        <view class="project-name">{{ project.name }}</view>
        <view class="project-info">
          <text class="progress">{{ project.progress }}%</text>
          <text class="status" :class="project.status">{{ project.statusText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EmptyState from '@/components/EmptyState.vue'

const projects = ref<any[]>([])

function goDetail(project: any) {
  console.log('project detail:', project)
}
</script>

<style lang="scss" scoped>
.projects-page {
  padding: 20rpx;
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.project-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

  .project-name {
    font-size: 30rpx;
    font-weight: 600;
    margin-bottom: 16rpx;
  }

  .project-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .progress {
    color: #1890ff;
    font-size: 28rpx;
    font-weight: 600;
  }

  .status {
    font-size: 24rpx;
    padding: 4rpx 16rpx;
    border-radius: 20rpx;

    &.active { background: #e6f7ff; color: #1890ff; }
    &.completed { background: #f6ffed; color: #52c41a; }
    &.suspended { background: #fff7e6; color: #faad14; }
  }
}
</style>
