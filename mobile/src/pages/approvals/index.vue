<template>
  <view class="approvals-page">
    <EmptyState v-if="approvals.length === 0" icon="✅" message="暂无待审批" />
    <view v-else class="approval-list">
      <view v-for="item in approvals" :key="item.id" class="approval-item">
        <view class="approval-header">
          <text class="title">{{ item.title }}</text>
          <text class="type">{{ item.typeText }}</text>
        </view>
        <view class="approval-body">
          <text>{{ item.description }}</text>
        </view>
        <view class="approval-actions">
          <button class="btn-reject" @click="onReject(item)">拒绝</button>
          <button class="btn-approve" @click="onApprove(item)">同意</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EmptyState from '@/components/EmptyState.vue'

const approvals = ref<any[]>([])

function onApprove(item: any) {
  console.log('approve:', item)
}

function onReject(item: any) {
  console.log('reject:', item)
}
</script>

<style lang="scss" scoped>
.approvals-page {
  padding: 20rpx;
}

.approval-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.approval-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

  .approval-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16rpx;
  }

  .title {
    font-weight: 600;
    font-size: 30rpx;
  }

  .type {
    color: #1890ff;
    font-size: 24rpx;
  }

  .approval-body {
    color: #666;
    font-size: 26rpx;
    margin-bottom: 20rpx;
  }

  .approval-actions {
    display: flex;
    gap: 20rpx;

    button {
      flex: 1;
      height: 72rpx;
      line-height: 72rpx;
      border-radius: 36rpx;
      font-size: 28rpx;
    }

    .btn-reject {
      background: #fff;
      color: #ff4d4f;
      border: 2rpx solid #ff4d4f;
    }

    .btn-approve {
      background: #1890ff;
      color: #fff;
    }
  }
}
</style>
