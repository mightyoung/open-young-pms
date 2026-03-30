<template>
  <view class="capture-page">
    <view class="steps">
      <view 
        v-for="(step, index) in steps" 
        :key="index"
        :class="['step', { active: currentStep >= index, current: currentStep === index }]"
      >
        <view class="step-dot">{{ index + 1 }}</view>
        <view class="step-label">{{ step }}</view>
      </view>
    </view>
    
    <view v-if="currentStep === 0" class="step-content">
      <view class="type-grid">
        <view 
          v-for="type in issueTypes" 
          :key="type.value"
          :class="['type-item', { selected: formData.type === type.value }]"
          @click="formData.type = type.value"
        >
          <view class="type-icon" :style="{ background: type.color }">{{ type.icon }}</view>
          <view class="type-name">{{ type.label }}</view>
        </view>
      </view>
    </view>
    
    <view v-if="currentStep === 1" class="step-content">
      <view class="photo-area" @click="takePhoto">
        <image v-if="formData.photos.length" :src="formData.photos[0]" mode="aspectFill" />
        <view v-else class="photo-placeholder">
          <text class="icon">📷</text>
          <text>点击拍照</text>
        </view>
      </view>
      <view class="location-info" v-if="location">
        <text>📍 {{ location.address }}</text>
      </view>
    </view>
    
    <view v-if="currentStep === 2" class="step-content">
      <textarea 
        v-model="formData.description"
        placeholder="请描述问题..."
        class="description-input"
      />
    </view>
    
    <view v-if="currentStep === 3" class="step-content">
      <view class="confirm-card">
        <image v-if="formData.photos[0]" :src="formData.photos[0]" mode="aspectFill" class="confirm-photo" />
        <view class="confirm-info">
          <text class="type-text">{{ getTypeLabel(formData.type) }}</text>
          <text class="desc-text">{{ formData.description }}</text>
          <text v-if="location" class="addr-text">📍 {{ location.address }}</text>
        </view>
      </view>
    </view>
    
    <view class="actions">
      <button v-if="currentStep > 0" @click="prevStep" class="btn-secondary">上一步</button>
      <button v-if="currentStep < 3" @click="nextStep" class="btn-primary">下一步</button>
      <button v-if="currentStep === 3" @click="submit" class="btn-primary">提交</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const currentStep = ref(0)
const steps = ['选择类型', '拍照', '描述', '确认']

const issueTypes = [
  { value: 'safety', label: '安全问题', icon: '🔴', color: '#ff4d4f' },
  { value: 'quality', label: '质量问题', icon: '🟡', color: '#faad14' },
  { value: 'progress', label: '进度问题', icon: '🔵', color: '#1890ff' },
  { value: 'equipment', label: '设备问题', icon: '🟠', color: '#fa8c16' },
]

const formData = reactive({
  type: '',
  photos: [] as string[],
  description: '',
  location: null as any
})

const location = ref<any>(null)

function nextStep() {
  if (currentStep.value < 3) currentStep.value++
}

function prevStep() {
  if (currentStep.value > 0) currentStep.value--
}

function getTypeLabel(type: string) {
  return issueTypes.find(t => t.value === type)?.label || ''
}

async function takePhoto() {
  uni.chooseImage({
    count: 1,
    sourceType: ['camera'],
    success: (res) => {
      formData.photos = res.tempFilePaths
      getLocation()
    }
  })
}

function getLocation() {
  uni.getLocation({
    success: (res) => {
      location.value = { address: `${res.latitude}, ${res.longitude}` }
    }
  })
}

async function submit() {
  uni.showLoading({ title: '提交中...' })
  try {
    await uni.request({
      url: 'http://localhost:8000/api/v1/issues',
      method: 'POST',
      data: {
        type: formData.type,
        photos: formData.photos,
        description: formData.description,
        location: location.value
      }
    })
    uni.showToast({ title: '提交成功', icon: 'success' })
    setTimeout(() => uni.switchTab({ url: '/pages/index/index' }), 1500)
  } catch (e) {
    uni.showToast({ title: '提交失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}
</script>

<style lang="scss" scoped>
.capture-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 140rpx;
}

.steps {
  display: flex;
  justify-content: space-between;
  padding: 32rpx 20rpx;
  background: #fff;

  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
    opacity: 0.4;

    &.active { opacity: 1; }
    &.current .step-dot {
      background: #1890ff;
      color: #fff;
    }
  }

  .step-dot {
    width: 48rpx;
    height: 48rpx;
    border-radius: 50%;
    background: #e5e5e5;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    font-weight: 600;
  }

  .step-label {
    font-size: 24rpx;
    color: #666;
  }
}

.step-content {
  margin-top: 40rpx;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;

  .type-item {
    background: #fff;
    border-radius: 16rpx;
    padding: 40rpx 20rpx;
    text-align: center;
    border: 4rpx solid transparent;
    transition: all 0.2s;

    &.selected {
      border-color: #1890ff;
      background: #e6f7ff;
    }
  }

  .type-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    margin: 0 auto 16rpx;
  }

  .type-name {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
  }
}

.photo-area {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;

  image {
    width: 100%;
    height: 500rpx;
  }
}

.photo-placeholder {
  height: 500rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  color: #999;

  .icon { font-size: 100rpx; }
  text { font-size: 28rpx; }
}

.location-info {
  margin-top: 20rpx;
  padding: 20rpx;
  background: #fff;
  border-radius: 12rpx;
  color: #666;
  font-size: 26rpx;
}

.description-input {
  width: 100%;
  min-height: 300rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.confirm-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;

  .confirm-photo {
    width: 100%;
    height: 400rpx;
  }

  .confirm-info {
    padding: 24rpx;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }

  .type-text { color: #1890ff; font-weight: 600; font-size: 30rpx; }
  .desc-text { color: #333; font-size: 28rpx; }
  .addr-text { color: #999; font-size: 24rpx; }
}

.actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  display: flex;
  gap: 20rpx;

  button {
    flex: 1;
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
  }

  .btn-primary { background: #1890ff; color: #fff; }
  .btn-secondary { background: #f5f5f5; color: #666; }
}
</style>
