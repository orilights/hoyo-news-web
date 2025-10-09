<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import ChannelInfo from '@/components/ChannelInfo.vue'
import LoadingIndicator from '@/components/common/LoadingIndicator.vue'
import FloatTool from '@/components/FloatTool.vue'
import Header from '@/components/Header.vue'
import NewsGridView from '@/components/news/NewsGridView.vue'
import NewsListView from '@/components/news/NewsListView.vue'
import NewsFilter from '@/components/NewsFilter.vue'
import { CONFIG_API } from '@/constants'
import { useMainStore } from '@/store/main'
import { useSettingsStore } from '@/store/settings'

const mainStore = useMainStore()
const settings = useSettingsStore()
const { newsLoading } = storeToRefs(mainStore)
const {
  useGridView,
  fullWidth,
} = storeToRefs(settings)

const toast = useToast()

onMounted(() => {
  mainStore.initialize()
  settings.tryMigrateFromV1Settings()

  fetchNotice()
  mainStore.fetchData()
})

function fetchNotice() {
  fetch(`${CONFIG_API}/hoyonews.notice`)
    .then(res => res.json())
    .then((res) => {
      if (res['hoyonews.notice']) {
        toast.info(res['hoyonews.notice'], {
          timeout: 10000,
          closeOnClick: false,
          draggable: false,
        })
      }
    })
    .catch((err) => {
      toast.error('获取公告数据失败')
      console.error(err)
    })
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 text-sm transition-[font-size] md:text-base">
    <div
      class="relative mx-2 pb-2 md:mx-4 xl:px-0" :class="{
        'lg:mx-auto lg:w-[960px]': !fullWidth,
        'lg:mx-10': fullWidth,
      }"
    >
      <Header />

      <ChannelInfo />

      <NewsFilter />

      <div v-if="newsLoading" class="flex flex-col items-center gap-2 py-16">
        <LoadingIndicator class="size-[60px]" />
        <span class="text-lg">数据加载中</span>
      </div>

      <NewsListView v-if="!useGridView" />

      <NewsGridView v-if="useGridView" />

      <FloatTool />
    </div>
  </div>
</template>

<style>
body {
  overflow-x: hidden;
  overflow-y: scroll;
}

.popup-setting-enter-active,
.popup-setting-leave-active,
.popup-dialog-enter-active,
.popup-dialog-leave-active,
.popup-action-enter-active,
.popup-action-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.popup-setting-enter-from,
.popup-setting-leave-to {
  opacity: 0;
  transform: translate(10px, -10px) scale(0.9);
}

.popup-dialog-enter-from,
.popup-dialog-leave-to {
  opacity: 0;
  transform: translateX(10px) scale(0.9);
}

.popup-action-enter-from,
.popup-action-leave-to {
  opacity: 0;
  transform: translate(-15px, -5px) scale(0.9);
}
</style>
