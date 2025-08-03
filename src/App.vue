<script setup lang="ts">
import { Settings, SettingType } from '@orilight/vue-settings'
import { useMediaQuery, useUrlSearchParams } from '@vueuse/core'
import { useToast } from 'vue-toastification'
import LoadingIndicator from '@/components/common/LoadingIndicator.vue'
import Switch from '@/components/common/Switch.vue'
import Tabs from '@/components/common/Tabs.vue'
import Header from '@/components/Header.vue'
import IconArrowDown from '@/components/icon/IconArrowDown.vue'
import IconArrowUp from '@/components/icon/IconArrowUp.vue'
import IconJump from '@/components/icon/IconJump.vue'
import IconRefresh from '@/components/icon/IconRefresh.vue'
import IconSetting from '@/components/icon/IconSetting.vue'
import NewsGrid from '@/components/NewsGrid.vue'
import NewsList from '@/components/NewsList.vue'
import TagList from '@/components/TagList.vue'
import {
  APP_ABBR,
  ARIA2_RPC_URL,
  BUILD_DATE,
  CONFIG_API,
  NEWS_LIST,
  SETTING_TABS,
  TAG_ALL,
  TAG_VIDEO,
  VISIT_PERSIST_KEY,
} from '@/constants'
import { state } from '@/state'
import { CoverSize } from '@/types/enum'
import { exportFile, formatTime, getAria2DownloadTask, getNewsType, getTags } from '@/utils'

const settings = new Settings(APP_ABBR)

const toast = useToast()

const params = useUrlSearchParams('history')
const windowWidth = {
  sm: useMediaQuery('(min-width: 640px)'),
  md: useMediaQuery('(min-width: 768px)'),
}
const coverSize = computed(() => {
  if (windowWidth.md.value)
    return CoverSize.Large
  if (windowWidth.sm.value)
    return CoverSize.Medium
  return CoverSize.Small
})

const showDialogSetting = ref(false)
const currentSettingTab = ref('general')
const showCover = ref(true)
const showDateWeek = ref(false)
const showVisited = ref(false)
const aria2Config = ref({
  rpcUrl: ARIA2_RPC_URL,
  rpcSecret: '',
  filename: '{newsTitle}.{ext}',
})
const useGridView = ref(false)
const fullWidth = ref(false)

const source = ref(Object.keys(NEWS_LIST)[0])
const channal = ref(Object.keys(NEWS_LIST[source.value].channals)[0])
const tags = ref<TagInfo[]>([])
const filterTag = ref(TAG_ALL)

const sortBy = ref<'asc' | 'desc'>('desc')
const dateFilterStart = ref('')
const dateFilterEnd = ref('')

const newsListRef = ref<any>(null)
const headerSticky = ref(false)

const newsItemConfig = computed(() => ({
  showBanner: showCover.value,
  showDateWeek: showDateWeek.value,
  showVisited: showVisited.value,
  coverSize: coverSize.value,
  aria2Config: aria2Config.value,
}))

const showDialogJump = ref(false)
const jumpDate = ref('')

const searchStr = ref('')
const searchEnabled = computed(() => searchStr.value.trim() !== '')

const newsUpdateTime = ref(0)
const newsLoading = ref(false)
const newsData = ref<NewsData[]>([])

const newsDataFiltered = computed(() => {
  let data: NewsData[]
  if (searchEnabled.value) {
    data = newsData.value.filter(news =>
      searchStr.value.toLowerCase().trim().split(' ').every((v) => {
        const newsKey = news.title.toLowerCase() + news.remoteId
        return newsKey.includes(v)
      }),
    )
  }
  else if (filterTag.value === TAG_ALL) {
    data = newsData.value.slice()
  }
  else if (filterTag.value === TAG_VIDEO) {
    data = newsData.value.filter(news => news.video)
  }
  else if (!tags.value.find(tag => tag.name === filterTag.value)) {
    data = newsData.value.slice()
  }
  else {
    data = newsData.value.filter(news => news.tag === filterTag.value)
  }
  if (dateFilterStart.value) {
    data = data.filter(news => new Date(news.startTime).getTime() >= new Date(`${dateFilterStart.value} 00:00:00`).getTime())
  }
  if (dateFilterEnd.value) {
    data = data.filter(news => new Date(news.startTime).getTime() <= new Date(`${dateFilterEnd.value} 23:59:59`).getTime())
  }

  return data
})

const newsDataSorted = computed(() => {
  const data = newsDataFiltered.value.slice()

  if (sortBy.value === 'asc')
    data.reverse()

  return data as NewsData[]
})

const dateRange = computed(() => {
  const range = { min: '', max: '' }
  if (newsDataSorted.value.length) {
    if (sortBy.value === 'asc') {
      range.min = formatTime(newsDataSorted.value[0].startTime, true)
      range.max = formatTime(newsDataSorted.value[newsDataSorted.value.length - 1].startTime, true)
    }
    else {
      range.min = formatTime(newsDataSorted.value[newsDataSorted.value.length - 1].startTime, true)
      range.max = formatTime(newsDataSorted.value[0].startTime, true)
    }
  }
  return range
})

onMounted(() => {
  document.addEventListener('click', (event) => {
    if (showDialogSetting.value) {
      if ((event.target as HTMLElement).closest('.setting') === null)
        showDialogSetting.value = false
    }
    if (showDialogJump.value) {
      if ((event.target as HTMLElement).closest('.dialog-jump') === null)
        showDialogJump.value = false
    }
  })

  registerSettings()
  try {
    if (localStorage.getItem(VISIT_PERSIST_KEY))
      state.newsVisited = new Set(JSON.parse(localStorage.getItem(VISIT_PERSIST_KEY) as string))
  }
  catch (err) {
    console.error(err)
  }
  if (params.filterTag)
    filterTag.value = params.filterTag as string
  if (params.source)
    source.value = params.source as string
  if (params.channal)
    channal.value = params.channal as string
  else
    channal.value = Object.keys(NEWS_LIST[source.value].channals)[0]

  fetchNotice()
  fetchData()

  watch(source, (val) => {
    channal.value = Object.keys(NEWS_LIST[val].channals)[0]
  })
})

onUnmounted(() => {
  settings.unregisterAll()
})

function registerSettings() {
  settings.register('showCover', showCover, SettingType.Bool)
  settings.register('showDateWeek', showDateWeek, SettingType.Bool)
  settings.register('showVisited', showVisited, SettingType.Bool)
  settings.register('aria2Config', aria2Config, SettingType.Object, { deepMerge: true })
  settings.register('useGridView', useGridView, SettingType.Bool)
  settings.register('fullWidth', fullWidth, SettingType.Bool)
}

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

function fetchData(force_refresh = false) {
  if (force_refresh) {
    window.umami?.track('a-manual-refresh')
  }
  newsLoading.value = true
  newsData.value = []
  tags.value = []
  const params = {
    source: source.value,
    channal: channal.value,
  }
  const apiBase = NEWS_LIST[params.source].channals[params.channal].apiBase
  fetch(`${apiBase}/news/${params.source}.${params.channal}${force_refresh ? '?force_refresh=1' : ''}`)
    .then(res => res.json())
    .then((res) => {
      if (params.source !== source.value || params.channal !== channal.value) {
        return
      }
      if (res.code !== 200) {
        toast.error(`服务器响应：${res.message}`)
      }
      if (res.data) {
        newsData.value = res.data.list.map((news: any) => ({
          ...news,
          remoteId: Number(news.remoteId),
          tag: news.tags || getNewsType(news, params.source, params.channal).type,
          startTime: formatTime(news.startTime),
        }))
        tags.value = getTags(newsData.value, params.source, params.channal)
        newsUpdateTime.value = res.data.lastSync
      }
    })
    .catch((err) => {
      toast.error('获取新闻数据失败，如有疑问请在 Github Issue 中提出')
      newsUpdateTime.value = 0
      console.error(err)
    })
    .finally(() => {
      newsLoading.value = false
    })
}

function changeTag(tag: string) {
  searchStr.value = ''
  if (filterTag.value === tag)
    filterTag.value = TAG_ALL
  else
    filterTag.value = tag

  if (filterTag.value === TAG_ALL)
    delete params.filterTag
  else
    params.filterTag = filterTag.value
}

function changeSource(newSource: string) {
  source.value = newSource
  channal.value = Object.keys(NEWS_LIST[newSource].channals)[0]
  handleSourceChange()
}

function changeChannal(newChannal: string) {
  channal.value = newChannal
  handleSourceChange()
}

function handleSourceChange() {
  params.source = source.value
  params.channal = channal.value
  filterTag.value = TAG_ALL
  delete params.filterTag
  fetchData()
}

function exportVideos() {
  window.umami?.track('a-export-videos')

  exportFile({
    filename: 'videos.txt',
    content: getAria2DownloadTask(newsData.value),
  })
  toast.success('导出下载任务成功')
}

function scrollTo(target: 'top' | 'bottom') {
  if (target === 'top')
    document.body.scrollIntoView({ behavior: 'smooth', block: 'start' })
  else
    document.body.scrollIntoView({ behavior: 'smooth', block: 'end' })
}

watch(jumpDate, (val) => {
  if (val) {
    handleScrollByDate()
  }
})

function changeDate(go: number) {
  if (jumpDate.value) {
    const date = new Date(jumpDate.value)
    date.setDate(date.getDate() + go)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    jumpDate.value = `${year}-${month}-${day}`
    handleScrollByDate()
  }
  else {
    toast.warning('请先选择日期')
  }
}

function handleChangeDialogSettingVisible() {
  showDialogSetting.value = !showDialogSetting.value
  if (showDialogSetting.value) {
    window.umami?.track('d-setting')
  }
}

function handleChangeDialogJumpVisible() {
  showDialogJump.value = !showDialogJump.value
  if (showDialogJump.value) {
    window.umami?.track('d-jump')
  }
}

function handleScrollByDate() {
  if (!newsListRef.value.scrollByDate(jumpDate.value)) {
    toast.error('未找到跳转目标')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 text-sm transition-[font-size] md:text-base">
    <div class="fixed bottom-4 right-4 z-20 flex items-end gap-2">
      <Transition name="popup-dialog">
        <div v-show="showDialogJump" class="dialog-jump rounded-lg bg-white p-4 shadow-md">
          <div class="font-bold">
            跳转到日期
          </div>
          <div class="my-2 flex items-center">
            <input
              v-model="jumpDate" v-bind="dateRange" type="date"
              class="rounded-md border border-black/20 bg-transparent px-1 transition-colors hover:border-blue-500"
            >
          </div>
          <button class="rounded-md border px-2 py-0.5 transition-colors hover:border-blue-500" @click="changeDate(-1)">
            向前
          </button>
          <button
            class="ml-2 rounded-md border px-2 py-0.5 transition-colors hover:border-blue-500"
            @click="changeDate(1)"
          >
            向后
          </button>
        </div>
      </Transition>
      <div class="flex flex-col">
        <button
          class="dialog-jump rounded-t-lg border border-gray-300 bg-white p-2 transition-colors hover:z-20 hover:border-blue-500 hover:text-blue-500"
          @click="handleChangeDialogJumpVisible"
        >
          <IconJump class="size-4" />
        </button>
        <button
          class="-mt-px border border-gray-300 bg-white p-2 transition-colors hover:z-20 hover:border-blue-500 hover:text-blue-500"
          @click="scrollTo('top')"
        >
          <IconArrowUp class="size-4" />
        </button>
        <button
          class="-mt-px rounded-b-lg border border-gray-300 bg-white p-2 transition-colors hover:z-20 hover:border-blue-500 hover:text-blue-500"
          @click="scrollTo('bottom')"
        >
          <IconArrowDown class="size-4" />
        </button>
      </div>
    </div>
    <div
      class="relative mx-2 py-2 md:mx-4 xl:px-0" :class="{
        'lg:mx-auto lg:w-[960px]': !fullWidth,
        'lg:mx-10': fullWidth,
      }"
    >
      <div class="flex items-center justify-between">
        <h1 class="py-6 text-2xl font-bold transition-[font-size]">
          米哈游官网新闻检索
        </h1>
      </div>

      <div class="sticky top-0 z-20">
        <div
          class="absolute right-0 top-[-54px] w-full" :class="{
            '!top-4': headerSticky,
          }"
        >
          <div class="absolute right-0 flex gap-4">
            <button class="setting" @click="handleChangeDialogSettingVisible">
              <IconSetting class="size-6" />
            </button>
          </div>
          <Transition name="popup-setting">
            <div
              v-show="showDialogSetting"
              class="setting absolute right-0 top-8 w-full rounded-lg bg-white p-2 pt-1 text-sm shadow-md sm:w-[300px]"
            >
              <Tabs v-model:selected-key="currentSettingTab" class="mb-2" :tabs="SETTING_TABS" />
              <div class="px-2">
                <template v-if="currentSettingTab === 'general'">
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
                  <div v-if="!useGridView" class="mb-2 flex items-center">
                    <span class="flex-1">置灰已阅读新闻</span>
                    <Switch v-model="showVisited" class="ml-2" />
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
                <template v-if="currentSettingTab === 'download'">
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
                <template v-if="currentSettingTab === 'about'">
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
                    </span>
                  </div>
                </template>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <Header
        :source="source" :channal="channal" :disabled="newsLoading" @change-source="changeSource"
        @change-channal="changeChannal" @update:sticky="headerSticky = $event"
      />

      <div class="mb-2 flex flex-wrap items-center">
        数据更新于：
        <template v-if="newsLoading">
          加载中
        </template>
        <template v-else>
          <span class="mr-2">
            {{ formatTime(newsUpdateTime) }}
          </span>
          <button class="flex items-center hover:text-blue-500" @click="fetchData(true)">
            <IconRefresh class="size-4" />
            <span class="ml-1">
              点击此处可刷新数据
            </span>
          </button>
        </template>
      </div>

      <input
        v-model="searchStr" type="text" placeholder="搜些什么吧"
        class="mb-2 w-full rounded-full border px-4 py-2 outline-blue-500 transition-colors hover:border-blue-500"
      >
      <div v-show="searchEnabled" class="mb-2">
        <span>
          搜索结果：{{ newsDataSorted.length }} 条
        </span>
        <button class="ml-4 hover:text-blue-500" @click="searchStr = ''">
          取消搜索
        </button>
      </div>

      <details v-show="!searchEnabled" class="mb-2" open>
        <summary>分类</summary>
        <TagList :tags="tags" :filter-tag="filterTag" @change-tag="changeTag" />
      </details>

      <div class="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span>
          排序：
          <select
            v-model="sortBy"
            class="rounded-md border border-black/20 bg-transparent px-1 transition-colors hover:border-blue-500"
          >
            <option value="desc">
              降序
            </option>
            <option value="asc">
              升序
            </option>
          </select>
        </span>

        <span>
          开始日期：
          <input
            v-model="dateFilterStart" type="date"
            class="rounded-md border border-black/20 bg-transparent px-1 transition-colors hover:border-blue-500"
            :max="dateFilterEnd"
          >
        </span>

        <span>
          结束日期：
          <input
            v-model="dateFilterEnd" type="date"
            class="rounded-md border border-black/20 bg-transparent px-1 transition-colors hover:border-blue-500"
            :min="dateFilterStart"
          >
        </span>

        <button
          v-if="dateFilterStart || dateFilterEnd" class="hover:text-blue-500"
          @click="dateFilterStart = ''; dateFilterEnd = ''"
        >
          取消筛选
        </button>
      </div>

      <div v-if="newsLoading" class="flex flex-col items-center gap-2 py-16">
        <LoadingIndicator class="size-[60px]" />
        <span class="text-lg">数据加载中</span>
      </div>

      <NewsList
        v-if="!useGridView" ref="newsListRef" :news="newsDataSorted" :source="source" :channal="channal"
        :config="newsItemConfig" :sort-by="sortBy" @change-filter="changeTag"
      />

      <NewsGrid
        v-if="useGridView" :news="newsDataSorted" :source="source" :channal="channal" :config="newsItemConfig"
        :sort-by="sortBy"
      />
    </div>
  </div>
</template>

<style>
body {
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
