<template>
  <view class="profile-page">
    <view class="profile-header">
      <image v-if="userInfo.avatar" :src="userInfo.avatar" class="avatar" />
      <view v-else class="avatar-placeholder">{{ userInfo.name?.[0] || '?' }}</view>
      <view class="user-info">
        <text class="name">{{ userInfo.name || '未登录' }}</text>
        <text class="phone">{{ userInfo.phone || '' }}</text>
      </view>
    </view>
    <view class="menu-list">
      <view class="menu-item" @click="goTo('/pages/tasks/index')">
        <text>我的任务</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @click="goTo('/pages/capture/index')">
        <text>我的问题</text>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @click="onSettings">
        <text>设置</text>
        <text class="arrow">›</text>
      </view>
    </view>
    <button class="logout-btn" @click="onLogout">退出登录</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const userInfo = ref<any>({})

function goTo(path: string) {
  uni.switchTab({ url: path })
}

function onSettings() {
  console.log('settings')
}

function onLogout() {
  uni.removeStorageSync('token')
  uni.showToast({ title: '已退出', icon: 'none' })
  setTimeout(() => uni.reLaunch({ url: '/pages/index/index' }), 1000)
}
</script>

<style lang="scss" scoped>
.profile-page {
  padding: 20rpx;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;

  .avatar, .avatar-placeholder {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
  }

  .avatar-placeholder {
    background: #1890ff;
    color: #fff;
    font-size: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .name {
    font-size: 36rpx;
    font-weight: 600;
  }

  .phone {
    color: #999;
    font-size: 26rpx;
  }
}

.menu-list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 32rpx;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  font-size: 28rpx;

  &:last-child { border-bottom: none; }

  .arrow { color: #ccc; font-size: 36rpx; }
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #fff;
  color: #ff4d4f;
  border-radius: 44rpx;
  font-size: 32rpx;
}
</style>
