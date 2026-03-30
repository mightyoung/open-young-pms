<template>
  <view class="home-page">
    <view class="welcome">欢迎回来，{{ userName }}</view>
    <view class="stats-row">
      <view class="stat-item">
        <text class="stat-value">{{ stats.pendingTasks }}</text>
        <text class="stat-label">待处理任务</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.pendingApprovals }}</text>
        <text class="stat-label">待审批</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ stats.myIssues }}</text>
        <text class="stat-label">我的问题</text>
      </view>
    </view>
    <view class="quick-actions">
      <view class="action-item" @click="goTo('/pages/capture/index')">
        <text class="action-icon">📷</text>
        <text>随手拍</text>
      </view>
      <view class="action-item" @click="goTo('/pages/tasks/index')">
        <text class="action-icon">📋</text>
        <text>我的任务</text>
      </view>
      <view class="action-item" @click="goTo('/pages/approvals/index')">
        <text class="action-icon">✅</text>
        <text>审批</text>
      </view>
    </view>
    <view class="section-title">最近项目</view>
    <EmptyState v-if="projects.length === 0" icon="📁" message="暂无项目" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EmptyState from '@/components/EmptyState.vue'

const userName = ref('用户')
const stats = ref({ pendingTasks: 0, pendingApprovals: 0, myIssues: 0 })
const projects = ref<any[]>([])

function goTo(path: string) {
  uni.switchTab({ url: path })
}
</script>

<style lang="scss" scoped>
.home-page {
  padding: 20rpx;
}

.welcome {
  font-size: 40rpx;
  font-weight: 600;
  margin-bottom: 32rpx;
}

.stats-row {
  display: flex;
  gap: 20rpx;
  margin-bottom: 40rpx;

  .stat-item {
    flex: 1;
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    text-align: center;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  }

  .stat-value {
    font-size: 48rpx;
    font-weight: 700;
    color: #1890ff;
    display: block;
  }

  .stat-label {
    font-size: 24rpx;
    color: #666;
    margin-top: 8rpx;
    display: block;
  }
}

.quick-actions {
  display: flex;
  gap: 20rpx;
  margin-bottom: 40rpx;

  .action-item {
    flex: 1;
    background: #fff;
    border-radius: 16rpx;
    padding: 32rpx 16rpx;
    text-align: center;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

    .action-icon {
      font-size: 56rpx;
      display: block;
      margin-bottom: 12rpx;
    }

    text:last-child {
      font-size: 26rpx;
      color: #333;
    }
  }
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
}
</style>
