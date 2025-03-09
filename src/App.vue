<script setup lang="ts">
import AnimationText from '@/components/AnimationText.vue'
import IconArrowDown from '@/components/icon/IconArrowDown.vue'
import IconArrowUp from '@/components/icon/IconArrowUp.vue'
import IconGithub from '@/components/icon/IconGithub.vue'
import IconJump from '@/components/icon/IconJump.vue'
import IconRefresh from '@/components/icon/IconRefresh.vue'
import IconSetting from '@/components/icon/IconSetting.vue'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import NewsItem from '@/components/NewsItem.vue'
import Switch from '@/components/Switch.vue'
import {
  APP_ABBR,
  ARIA2_RPC_URL,
  ITEM_GAP,
  NEWS_CLASSIFY_RULE,
  NEWS_LIST,
  REPO_URL,
  SHADOW_ITEM,
  TAG_ALL,
  TAG_OTHER,
  TAG_VIDEO,
  VISIT_PERSIST_KEY,
} from '@/constants'
import { state } from '@/state'
import { CoverSize } from '@/types/enum'
import { exportFile, formatTime, limitSetSize, sanitizeFilename } from '@/utils'
import { Settings, SettingType } from '@orilight/vue-settings'
import { useElementBounding, useElementSize, useMediaQuery, useThrottle, useUrlSearchParams } from '@vueuse/core'
import { useToast } from 'vue-toastification'

const settings = new Settings(APP_ABBR)

const toast = useToast()

const containerRef = ref<HTMLElement>()
const shadowItemRef = ref<HTMLElement>()
const containerTop = useThrottle(useElementBounding(containerRef).top, 30, true)
const itemHeight = useElementSize(shadowItemRef).height
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

const showSetting = ref(false)
const showCover = ref(true)
const showDateWeek = ref(false)
const showVisited = ref(false)
const sortByDate = ref(true)
const aria2Config = ref({
  rpcUrl: ARIA2_RPC_URL,
  rpcSecret: '',
  filename: '{newsTitle}.{ext}',
})

const source = ref(Object.keys(NEWS_LIST)[0])
const channal = ref(Object.keys(NEWS_LIST[source.value].channals)[0])
const tags = ref<{ [index: string]: number }>({})
const filterTag = ref(TAG_ALL)

const sortBy = ref('desc')
const dateFilterStart = ref('')
const dateFilterEnd = ref('')

const headerRef = ref<HTMLElement | null>(null)
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
      searchStr.value.toLowerCase().trim().split(' ').every(v =>
        news.title.toLowerCase().includes(v),
      ),
    )
  }
  else if (filterTag.value === TAG_ALL) {
    data = newsData.value.slice()
  }
  else if (filterTag.value === TAG_VIDEO) {
    data = newsData.value.filter(news => news.video)
  }
  else if (!Object.keys(tags.value).includes(filterTag.value)) {
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

  if (sortByDate.value) {
    data.sort((a, b) => {
      const bt = new Date(b.startTime).getTime()
      const at = new Date(a.startTime).getTime()
      if (bt === at)
        return Number(b.id) - Number(a.id)
      return bt - at
    })
  }

  if (sortBy.value === 'asc')
    data.reverse()

  data.forEach((v, i) => {
    (v as NewsItemData).top = (itemHeight.value + ITEM_GAP) * i
  })

  return data as NewsItemData[]
})

const itemRenderList = computed(() => {
  const renderRange = {
    up: 0.5,
    down: 0.5,
  }
  const renderRangeTop = -containerTop.value - renderRange.up * window.innerHeight
  const renderRangeBottom = -containerTop.value + window.innerHeight + renderRange.down * window.innerHeight
  return newsDataSorted.value.filter((item: NewsItemData) => {
    return (item.top + itemHeight.value > renderRangeTop && item.top < renderRangeBottom)
  })
})

onMounted(() => {
  document.addEventListener('click', (event) => {
    if (showSetting.value) {
      if ((event.target as HTMLElement).closest('.setting') === null)
        showSetting.value = false
    }
    if (showDialogJump.value) {
      if ((event.target as HTMLElement).closest('.dialog-jump') === null)
        showDialogJump.value = false
    }
  })
  document.addEventListener('scroll', () => {
    headerSticky.value = (headerRef.value?.getBoundingClientRect().top || 0) === 0 && window.scrollY > 0
  })
  settings.register('showCover', showCover, SettingType.Bool)
  settings.register('showDateWeek', showDateWeek, SettingType.Bool)
  settings.register('sortNews', sortByDate, SettingType.Bool)
  settings.register('showVisited', showVisited, SettingType.Bool)
  settings.register('aria2Config', aria2Config, SettingType.Object, { deepMerge: true })
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

  fetchData()

  watch(source, (val) => {
    channal.value = Object.keys(NEWS_LIST[val].channals)[0]
  })
})

onUnmounted(() => {
  settings.unregisterAll()
})

function fetchData(force_refresh = false) {
  newsLoading.value = true
  newsData.value = []
  tags.value = {}
  const fetchSource = source.value
  const fetchChannal = channal.value
  fetch(`${NEWS_LIST[fetchSource].channals[fetchChannal].apiBase}/${fetchSource}/${fetchChannal}${force_refresh ? '?force_refresh=1' : ''}`)
    .then(res => res.json())
    .then((res) => {
      if (fetchSource !== source.value || fetchChannal !== channal.value) {
        return
      }
      if (res.code !== 0) {
        toast.error(`服务器响应：${res.msg}`)
      }
      if (res.data) {
        const newsList = res.data
        tags.value[TAG_ALL] = newsList.length
        tags.value[TAG_VIDEO] = 0
        newsList.forEach((news: any) => {
          if (news.video)
            tags.value[TAG_VIDEO] += 1
          const tag = getNewsType(news.title, news.id)
          if (tags.value[tag] === undefined)
            tags.value[tag] = 1
          else
            tags.value[tag] += 1
          news.tag = tag
          if (typeof news.startTime === 'number')
            news.startTime = formatTime(news.startTime)
        })
        newsData.value = newsList
        newsUpdateTime.value = res.update
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

function handleFilterTag(tag: string) {
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

function getNewsType(title: string, id: number): string {
  if (!Object.keys(NEWS_CLASSIFY_RULE).includes(source.value))
    return TAG_OTHER
  for (const [type, rule] of Object.entries(NEWS_CLASSIFY_RULE[source.value])) {
    if (rule.include.includes(id))
      return type
  }
  for (const [type, rule] of Object.entries(NEWS_CLASSIFY_RULE[source.value])) {
    if (rule.exclude.includes(id))
      continue
    for (const keyword of rule.keyword) {
      if (typeof keyword === 'string') {
        if (title.includes(keyword))
          return type
      }
      else if (keyword instanceof RegExp) {
        if (keyword.test(title))
          return type
      }
    }
  }
  return TAG_OTHER
}

function exportVideos() {
  let result = ''
  newsDataSorted.value.filter(news => news.video).forEach((news: any) => {
    const fileExt = news.video.split('.').pop()
    result += `${news.video}\n  out=${sanitizeFilename(news.title)}.${fileExt}\n`
  })
  exportFile({
    filename: 'videos.txt',
    content: result,
  })
  toast.success('导出下载任务成功')
}

function scrollTo(target: 'top' | 'bottom') {
  if (target === 'top')
    document.body.scrollIntoView({ behavior: 'smooth', block: 'start' })
  else
    document.body.scrollIntoView({ behavior: 'smooth', block: 'end' })
}

function scrollByDate(date: string) {
  let target
  if (sortBy.value === 'desc') {
    target = newsDataSorted.value.find(news => new Date(news.startTime) <= new Date(`${date} 23:59:59`))
  }
  else {
    target = newsDataSorted.value.find(news => new Date(news.startTime) >= new Date(`${date} 00:00:00`))
  }
  if (target) {
    const containerTop = containerRef.value?.offsetTop || 0
    window.document.documentElement.scrollTo({ top: containerTop + target.top, behavior: 'smooth' })
    showDialogJump.value = false
  }
  else {
    toast.error('未找到跳转目标')
  }
}

function handlePerisitVisitRecord() {
  if (!showVisited.value)
    return
  limitSetSize(state.newsVisited, 2000)
  localStorage.setItem(VISIT_PERSIST_KEY, JSON.stringify(Array.from(state.newsVisited)))
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 text-sm transition-[font-size] md:text-base">
    <div class="fixed bottom-4 right-4 z-20 flex items-end gap-2">
      <Transition name="popup-dialog">
        <div
          v-show="showDialogJump"
          class="dialog-jump rounded-lg bg-white p-4 shadow-md"
        >
          <div class="font-bold">
            跳转到日期
          </div>
          <div class="my-2 flex items-center">
            <input
              v-model="jumpDate"
              type="date"
              class="rounded-md border border-black/20 bg-transparent px-1 transition-colors hover:border-blue-500"
            >
          </div>
          <button
            class="rounded-md border px-2 py-0.5 transition-colors hover:border-blue-500"
            @click="scrollByDate(jumpDate)"
          >
            确认
          </button>
        </div>
      </Transition>
      <div class="flex flex-col">
        <button
          class="dialog-jump rounded-t-lg border border-gray-300 bg-white p-2 transition-colors hover:z-20 hover:border-blue-500 hover:text-blue-500"
          @click="showDialogJump = !showDialogJump"
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
    <div class="relative mx-2 py-2 md:mx-4 lg:mx-auto lg:w-[960px] xl:px-0">
      <div class="flex items-center justify-between">
        <h1 class="py-6 text-2xl font-bold transition-[font-size] md:text-4xl">
          米哈游官网新闻检索
        </h1>
      </div>

      <div class="sticky top-0 z-20">
        <div
          class="absolute right-0 top-[-54px] w-full"
          :class="{
            '!top-4': headerSticky,
          }"
        >
          <div class="absolute right-0 flex gap-4">
            <a v-show="!headerSticky" :href="REPO_URL" target="_blank">
              <IconGithub class="size-6" />
            </a>
            <button
              class="setting"
              @click="showSetting = !showSetting"
            >
              <IconSetting class="size-6" />
            </button>
          </div>
          <Transition name="popup-setting">
            <div
              v-show="showSetting"
              class="setting absolute right-0 top-8 rounded-lg bg-white p-4 shadow-md"
            >
              <div class="my-1 flex items-center">
                <span class="flex-1">显示封面</span> <Switch v-model="showCover" class="ml-2" />
              </div>
              <div class="my-1 flex items-center">
                <span class="flex-1">根据发布时间排序</span> <Switch v-model="sortByDate" class="ml-2" />
              </div>
              <div class="my-1 flex items-center">
                <span class="flex-1">发布时间显示星期</span> <Switch v-model="showDateWeek" class="ml-2" />
              </div>
              <div class="my-1 flex items-center">
                <span class="flex-1">置灰已阅读新闻</span> <Switch v-model="showVisited" class="ml-2" />
              </div>
              <div class="my-1">
                <span class="flex-1">aria2 RPC地址</span>
                <br>
                <input
                  v-model="aria2Config.rpcUrl" type="text"
                  class="w-full rounded-md border border-black/20 bg-transparent px-1 transition-colors"
                >
              </div>
              <div class="my-1">
                <span class="flex-1">aria2 RPC密钥</span>
                <br>
                <input
                  v-model="aria2Config.rpcSecret" type="text"
                  class="w-full rounded-md border border-black/20 bg-transparent px-1 transition-colors"
                >
              </div>
              <button class="rounded-md border px-2 py-0.5 transition-colors hover:border-blue-500" @click="exportVideos">
                导出本页视频至 aria2 任务
              </button>
            </div>
          </Transition>
        </div>
      </div>

      <div
        ref="headerRef"
        class="header sticky top-0 z-10 pt-2 backdrop-blur transition-all"
        :class="{
          'mx-[-8px] bg-[#f3f4f6]/80 pl-2 pr-4 md:mx-[-16px] md:pl-4': headerSticky,
        }"
      >
        <div
          class="mb-2 flex flex-wrap gap-1"
          :class="{
            'pr-4': headerSticky,
          }"
        >
          <button
            v-for="[source_key, source_info] in Object.entries(NEWS_LIST)" :key="source_key"
            class="flex shrink-0 items-center overflow-hidden rounded-full border p-1 transition-colors"
            :class="{
              'hover:border-blue-500': !newsLoading,
              'border-blue-500 text-blue-500': source === source_key,
            }"
            :disabled="newsLoading || source === source_key"
            @click="changeSource(source_key)"
          >
            <img
              class="size-6 rounded-full md:size-8"
              :alt="source_info.displayName"
              :src="`./images/icon/${source_key}-48px.png`"
            >
            <AnimationText :show="source === source_key">
              <span class="mx-1 sm:mx-2">
                {{ source_info.displayName }}
              </span>
            </AnimationText>
          </button>
        </div>

        <div class="mb-2">
          <button
            v-for="[channal_key, channal_info] in Object.entries(NEWS_LIST[source].channals)" :key="channal_key"
            class="border-b-2 bg-transparent px-2 py-1 transition-colors"
            :class="{
              'hover:text-blue-500': !newsLoading,
              'border-blue-500 text-blue-500': channal === channal_key,
            }"
            :disabled="newsLoading || channal === channal_key"
            @click="changeChannal(channal_key)"
          >
            {{ channal_info.displayName }}
          </button>
        </div>
      </div>

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
        <ul class="mt-2 flex flex-wrap gap-1">
          <li
            v-for="tag in Object.keys(tags).sort((a, b) => tags[b] - tags[a])" :key="tag"
            class="inline-block cursor-pointer rounded-full border border-gray-400 px-2 py-0.5 text-xs transition-colors hover:border-blue-400 hover:text-blue-500 md:px-3 md:py-1 md:text-sm"
            :class="{
              '!border-blue-500 !bg-blue-500 !text-white': filterTag === tag,
            }"
            @click="handleFilterTag(tag)"
          >
            {{ tag }} {{ tags[tag] }}
          </li>
        </ul>
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
            v-model="dateFilterStart"
            type="date"
            class="rounded-md border border-black/20 bg-transparent px-1 transition-colors hover:border-blue-500"
            :max="dateFilterEnd"
          >
        </span>

        <span>
          结束日期：
          <input
            v-model="dateFilterEnd"
            type="date"
            class="rounded-md border border-black/20 bg-transparent px-1 transition-colors hover:border-blue-500"
            :min="dateFilterStart"
          >
        </span>

        <button
          v-if="dateFilterStart || dateFilterEnd"
          class="hover:text-blue-500"
          @click="dateFilterStart = '';dateFilterEnd = ''"
        >
          取消筛选
        </button>
      </div>

      <div v-if="newsLoading" class="flex flex-col items-center gap-2 py-16">
        <LoadingIndicator class="size-[60px]" />
        <span class="text-lg">数据加载中</span>
      </div>
      <ul
        ref="containerRef"
        class="relative overflow-hidden"
        :style="{
          height: `${newsDataSorted.length * (itemHeight + ITEM_GAP)}px`,
        }"
      >
        <NewsItem
          ref="shadowItemRef"
          :news="SHADOW_ITEM"
          :source="source"
          :channal="channal"
          :config="newsItemConfig"
          :style="{ pointerEvent: 'none', userSelect: 'none' }"
        />
        <NewsItem
          v-for="news in itemRenderList" :key="news.id"
          :news="news"
          :source="source"
          :channal="channal"
          :config="newsItemConfig"
          @change-filter="handleFilterTag"
          @visit="handlePerisitVisitRecord"
        />
      </ul>
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
