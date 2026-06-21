<script setup lang="ts">
import { useOverlayScrollbars } from 'overlayscrollbars-vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import LoadingIndicator from '@/components/common/LoadingIndicator.vue'
import FloatTool from '@/components/FloatTool.vue'
import Header from '@/components/Header.vue'
import NewsGridView from '@/components/news/NewsGridView.vue'
import NewsListView from '@/components/news/NewsListView.vue'
import { CONFIG_API } from '@/constants'
import { useMainStore } from '@/store/main'
import { useSettingsStore } from '@/store/settings'
import NewsBrowser from './components/NewsBrowser.vue'
import RssInfo from './components/RssInfo.vue'
import SettingPanel from './components/SettingPanel.vue'
import Sidebar from './components/Sidebar.vue'
import VideoPlayer from './components/VideoPlayer.vue'

const mainStore = useMainStore()
const settings = useSettingsStore()
const { newsLoading, lockBodyScroll } = storeToRefs(mainStore)
const {
  useGridView,
} = storeToRefs(settings)

const toast = useToast()
const [initBodyOverlayScrollbars, getOverlayScrollbarsInstance]
  = useOverlayScrollbars({
    defer: true,
    options: {
      scrollbars: {
        theme: 'os-theme-dark',
        clickScroll: true,
      },
    },
  })

watch(lockBodyScroll, (val) => {
  const osInstance = getOverlayScrollbarsInstance()
  if (val) {
    osInstance?.options({ overflow: { y: 'hidden' }, scrollbars: { visibility: 'hidden' } })
  }
  else {
    osInstance?.options({ overflow: { y: 'scroll' }, scrollbars: { visibility: 'auto' } })
  }
}, { immediate: true })

onMounted(() => {
  initBodyOverlayScrollbars(document.body)

  settings.initialize()
  mainStore.initialize()

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
  <div class="flex min-h-screen bg-gray-100 text-sm transition-[font-size] md:text-base">
    <Sidebar />

    <div class="relative flex-1 px-2 pb-4 md:px-4">
      <Header />

      <div v-if="newsLoading" class="flex flex-col items-center gap-2 py-16">
        <LoadingIndicator class="size-[60px]" />
        <span class="text-lg">数据加载中</span>
      </div>

      <NewsListView v-if="!useGridView" />

      <NewsGridView v-if="useGridView" />
    </div>

    <FloatTool />

    <VideoPlayer />

    <NewsBrowser />

    <RssInfo />

    <SettingPanel />
  </div>
</template>

<style>

</style>
