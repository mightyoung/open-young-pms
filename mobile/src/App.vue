<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { offlineQueue } from '@/utils/offline'

onLaunch(() => {
  console.log('App Launch')
  offlineQueue.startAutoSync()
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
@import './uni.scss';
</style>
