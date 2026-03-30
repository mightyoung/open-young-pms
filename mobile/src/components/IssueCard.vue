<template>
  <view class="issue-card" @click="onClick">
    <view class="card-header">
      <view class="status-badge" :style="{ background: statusColor }">{{ statusText }}</view>
      <text class="time">{{ issue.createdAt }}</text>
    </view>
    <view class="card-body">
      <image v-if="issue.photo" :src="issue.photo" mode="aspectFill" class="issue-photo" />
      <view class="issue-info">
        <text class="type-label">{{ typeLabel }}</text>
        <text class="description">{{ issue.description }}</text>
      </view>
    </view>
    <view v-if="issue.address" class="card-footer">
      <text class="address">📍 {{ issue.address }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Issue {
  id: string
  type: string
  description: string
  photo?: string
  address?: string
  status: string
  createdAt: string
}

const props = defineProps<{ issue: Issue }>()
const emit = defineEmits(['click'])

const typeMap: Record<string, { label: string; color: string }> = {
  safety: { label: '安全问题', color: '#ff4d4f' },
  quality: { label: '质量问题', color: '#faad14' },
  progress: { label: '进度问题', color: '#1890ff' },
  equipment: { label: '设备问题', color: '#fa8c16' },
}

const statusMap: Record<string, { text: string; color: string }> = {
  pending: { text: '待处理', color: '#faad14' },
  processing: { text: '处理中', color: '#1890ff' },
  resolved: { text: '已解决', color: '#52c41a' },
  closed: { text: '已关闭', color: '#999' },
}

const typeLabel = computed(() => typeMap[props.issue.type]?.label || props.issue.type)
const statusText = computed(() => statusMap[props.issue.status]?.text || props.issue.status)
const statusColor = computed(() => statusMap[props.issue.status]?.color || '#999')

function onClick() {
  emit('click', props.issue)
}
</script>

<style lang="scss" scoped>
.issue-card {
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

  .status-badge {
    padding: 4rpx 16rpx;
    border-radius: 20rpx;
    color: #fff;
    font-size: 24rpx;
  }

  .time {
    color: #999;
    font-size: 24rpx;
  }

  .card-body {
    display: flex;
    gap: 16rpx;
  }

  .issue-photo {
    width: 160rpx;
    height: 160rpx;
    border-radius: 12rpx;
  }

  .issue-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .type-label {
    color: #1890ff;
    font-weight: 600;
    font-size: 28rpx;
  }

  .description {
    color: #333;
    font-size: 28rpx;
    lines: 2;
    overflow: hidden;
  }

  .card-footer {
    margin-top: 16rpx;
  }

  .address {
    color: #999;
    font-size: 24rpx;
  }
}
</style>
