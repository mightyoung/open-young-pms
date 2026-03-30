<template>
  <view class="empty-state">
    <text class="icon">{{ icon }}</text>
    <text class="message">{{ message }}</text>
    <button v-if="actionText" class="action-btn" @click="onAction">{{ actionText }}</button>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string
  message?: string
  actionText?: string
}>()

const emit = defineEmits(['action'])

function onAction() {
  emit('action')
}
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;

  .icon {
    font-size: 120rpx;
    margin-bottom: 32rpx;
  }

  .message {
    color: #999;
    font-size: 28rpx;
    text-align: center;
    margin-bottom: 40rpx;
  }

  .action-btn {
    background: #1890ff;
    color: #fff;
    padding: 20rpx 60rpx;
    border-radius: 44rpx;
    font-size: 28rpx;
  }
}
</style>
