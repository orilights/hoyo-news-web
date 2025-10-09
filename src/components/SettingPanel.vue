<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import Switch from '@/components/common/Switch.vue'
import Tabs from '@/components/common/Tabs.vue'
import { BUILD_COMMIT, BUILD_DATE, SETTING_TABS } from '@/constants'
import { useMainStore } from '@/store/main'
import { useSettingsStore } from '@/store/settings'
import { exportFile, formatTime, getAria2DownloadTask } from '@/utils'

const visible = defineModel<boolean>('visible')

const toast = useToast()
const mainStore = useMainStore()
const settingsStore = useSettingsStore()
const { currentChannel, newsDataFiltered, customFilterCount } = storeToRefs(mainStore)
const {
  showCover,
  showDateWeek,
  showVisited,
  useGridView,
  fullWidth,
  aria2Config,
  customFilter,
} = storeToRefs(settingsStore)

const currentTab = ref('general')

onMounted(() => {
  document.addEventListener('click', (event) => {
    if (visible.value) {
      if ((event.target as HTMLElement).closest('.setting') === null)
        visible.value = false
    }
  })
})

function exportVideos() {
  window.umami?.track('a-export-videos')
  const videoList = newsDataFiltered.value.filter(news => news.video)
  if (videoList.length === 0) {
    toast.warning('当前没有可导出的视频')
    return
  }
  if (currentChannel.value.startsWith('bbs')) {
    toast.warning('米游社暂不支持导出视频下载任务')
    return
  }

  exportFile({
    filename: 'videos.txt',
    content: getAria2DownloadTask(videoList),
  })
  toast.success('导出下载任务成功')
}
</script>

<template>
  <Transition name="popup-setting">
    <div
      v-show="visible"
      class="setting absolute right-0 top-8 w-full rounded-lg bg-white p-2 pt-1 text-sm shadow-md sm:w-[320px]"
    >
      <Tabs v-model:selected-key="currentTab" class="mb-2" :tabs="SETTING_TABS" />
      <div class="px-2">
        <template v-if="currentTab === 'general'">
          <div class="mb-2 flex items-center">
            <span class="flex-1">网格视图</span>
            <Switch v-model="useGridView" class="ml-2" />
          </div>
          <div class="mb-2 flex items-center">
            <span class="flex-1">宽屏模式</span>
            <Switch v-model="fullWidth" class="ml-2" />
          </div>
          <div v-if="!useGridView" class="mb-2 flex items-center">
            <span class="flex-1">显示封面</span>
            <Switch v-model="showCover" class="ml-2" />
          </div>
          <div v-if="!useGridView" class="mb-2 flex items-center">
            <span class="flex-1">发布时间显示星期</span>
            <Switch v-model="showDateWeek" class="ml-2" />
          </div>
          <div class="mb-2 flex items-center">
            <span class="flex-1">置灰已阅读新闻</span>
            <Switch v-model="showVisited" class="ml-2" />
          </div>
          <div class="mb-2">
            <div class="flex items-center">
              <span class="flex-1">启用内置关键词过滤</span>
              <Switch v-model="customFilter.enable" class="ml-2" />
            </div>
            <div v-if="customFilter.enable" class="text-xs">
              当前页面过滤数量：{{ customFilterCount }}
            </div>
          </div>
          <div class="mb-2">
            <button
              class="rounded-md border px-2 py-0.5 transition-colors hover:border-blue-500"
              @click="exportVideos"
            >
              导出本页视频至 aria2 任务
            </button>
          </div>
        </template>
        <template v-if="currentTab === 'download'">
          <div class="mb-2">
            <div class="mb-1">
              aria2 RPC地址
            </div>
            <input
              v-model="aria2Config.rpcUrl" type="text"
              class="w-full rounded-md border border-black/20 bg-transparent px-1.5 py-0.5 text-sm outline-blue-500 transition-colors hover:border-blue-500"
            >
          </div>
          <div class="mb-2">
            <div class="mb-1">
              aria2 RPC密钥
            </div>
            <input
              v-model="aria2Config.rpcSecret" type="text"
              class="w-full rounded-md border border-black/20 bg-transparent px-1.5 py-0.5 text-sm outline-blue-500 transition-colors hover:border-blue-500"
            >
          </div>
        </template>
        <template v-if="currentTab === 'about'">
          <div class="mb-2 flex items-center rounded-lg border p-2 text-sm">
            <img src="/favicon.png" class="mr-2 size-12">
            一个用于检索米哈游旗下游戏官网新闻的小工具
          </div>
          <div class="mb-2 flex items-center gap-2">
            <span class="flex-1">作者</span>
            <a href="https://orilight.top" target="_blank" class="text-blue-500 hover:underline">
              OriLight
            </a>
          </div>
          <div class="mb-2 flex items-center gap-2">
            <span class="flex-1">Github</span>
            <a
              href="https://github.com/orilights/hoyo-news-web" target="_blank"
              class="text-blue-500 hover:underline"
            >
              hoyo-news-web
            </a>
          </div>
          <div class="mb-2 flex items-center gap-2">
            <span class="flex-1">构建时间</span>
            <span>
              {{ formatTime(BUILD_DATE) }}
              <template v-if="BUILD_COMMIT">
                (<a
                  :href="`https://github.com/orilights/hoyo-news-web/commit/${BUILD_COMMIT}`" target="_blank"
                  class="text-blue-500 hover:underline"
                >
                  {{ BUILD_COMMIT }}
                </a>)
              </template>
            </span>
          </div>
        </template>
      </div>
    </div>
  </Transition>
</template>

<style scoped>

</style>
