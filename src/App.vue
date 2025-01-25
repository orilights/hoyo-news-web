<script setup lang="ts">
import NewsItem from '@/components/NewsItem.vue'
import Switch from '@/components/Switch.vue'
import { APP_ABBR, NEWS_CLASSIFY_RULE, NEWS_LIST, REPO_URL, SHADOW_ITEM, TAG_ALL, TAG_OTHER, TAG_VIDEO } from '@/constants'
import { Settings, SettingType } from '@orilight/vue-settings'
import { useElementBounding, useElementSize, useThrottle, useUrlSearchParams } from '@vueuse/core'
import { useToast } from 'vue-toastification'

const settings = new Settings(APP_ABBR)

const toast = useToast()

const newsData = ref<NewsData[]>([])
const newsUpdateTime = ref(0)
const tags = ref<{ [index: string]: number }>({})
const container = ref<HTMLElement>()
const shadowItem = ref<HTMLElement>()
const containerTop = useThrottle(useElementBounding(container).top, 30, true)
const itemHeight = useElementSize(shadowItem).height
const params = useUrlSearchParams('history')
const filterTag = ref(TAG_ALL)
const source = ref(Object.keys(NEWS_LIST)[0])
const channal = ref('')
const searchStr = ref('')
const loading = ref(false)

const showSetting = ref(false)
const showCover = ref(true)
const showDateWeek = ref(false)
const sortByDate = ref(true)
const sortBy = ref('desc')
const filterStartDate = ref('')
const filterEndDate = ref('')

const searchEnabled = computed(() => searchStr.value.trim() !== '')

const filteredNewsData = computed(() => {
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
  if (filterStartDate.value) {
    data = data.filter(news => new Date(news.startTime).getTime() >= new Date(`${filterStartDate.value} 00:00:00`).getTime())
  }
  if (filterEndDate.value) {
    data = data.filter(news => new Date(news.startTime).getTime() <= new Date(`${filterEndDate.value} 23:59:59`).getTime())
  }

  return data
})

const sortedNewsData = computed(() => {
  const data = filteredNewsData.value.slice()

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
    (v as NewsItemData).top = (itemHeight.value + 8) * i
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
  return sortedNewsData.value.filter((item: NewsItemData) => {
    return (item.top + itemHeight.value > renderRangeTop && item.top < renderRangeBottom)
  })
})

onMounted(() => {
  document.addEventListener('click', (event) => {
    if (!showSetting.value)
      return

    if ((event.target as HTMLElement).closest('.setting') === null)
      showSetting.value = false
  })
  settings.register('showCover', showCover, SettingType.Bool)
  settings.register('showDateWeek', showDateWeek, SettingType.Bool)
  settings.register('sortNews', sortByDate, SettingType.Bool)
  if (params.filterTag)
    filterTag.value = params.filterTag as string
  if (params.source)
    source.value = params.source as string
  if (params.channal)
    channal.value = params.channal as string
  fetchData()
})

watch(source, (val) => {
  channal.value = Object.keys(NEWS_LIST[val].channals)[0]
}, { immediate: true })

function fetchData(force_refresh = false) {
  loading.value = true
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
      loading.value = false
    })
}

function handleClickTag(tag: string) {
  if (filterTag.value === tag)
    filterTag.value = TAG_ALL
  else
    filterTag.value = tag

  if (filterTag.value === TAG_ALL)
    delete params.filterTag
  else
    params.filterTag = filterTag.value
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

function formatTime(timestamp: number) {
  if (timestamp.toString().length === 10)
    timestamp *= 1000
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

function exportVideos() {
  let result = ''
  sortedNewsData.value.filter(news => news.video).forEach((news: any) => {
    const fileExt = news.video.split('.').pop()
    result += `${news.video}\n  out=${news.title}.${fileExt}\n`
  })
  const blob = new Blob([result], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'videos.txt'
  a.click()
  toast.success('导出下载任务成功')
}

function scrollTo(target: 'top' | 'bottom') {
  if (target === 'top')
    document.body.scrollIntoView({ behavior: 'smooth', block: 'start' })
  else
    document.body.scrollIntoView({ behavior: 'smooth', block: 'end' })
}
</script>

<template>
  <div class="min-h-screen bg-gray-200">
    <div class="fixed bottom-4 right-4 z-10">
      <button class="block rounded-t-lg border border-gray-300 bg-white p-2 text-black  transition-colors hover:border-blue-500" @click="scrollTo('top')">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
        </svg>
      </button>
      <button class="block rounded-b-lg border border-gray-300 bg-white p-2 text-black hover:border-blue-500" @click="scrollTo('bottom')">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
        </svg>
      </button>
    </div>
    <div class="relative mx-4 py-2 lg:mx-auto lg:w-[960px] xl:px-0">
      <Transition name="popup">
        <div
          v-show="showSetting"
          class="setting absolute right-0 top-[75px] z-10 rounded-lg bg-white p-4 shadow-md"
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
          <button class="rounded-md border px-2 py-0.5 transition-colors hover:border-blue-500" @click="exportVideos">
            导出本页视频至 aria2 任务
          </button>
        </div>
      </Transition>

      <div class="flex items-center justify-between">
        <h1 class="py-6 text-2xl font-bold sm:text-4xl">
          米哈游官网新闻检索
        </h1>
        <div class="flex gap-4">
          <a :href="REPO_URL" target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 1024 1024" stroke="currentColor" class="size-6">
              <path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9 23.5 23.2 38.1 55.4 38.1 91v112.5c0.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z" />
            </svg>
          </a>
          <button class="setting" @click="showSetting = !showSetting">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
              <path fill-rule="evenodd" d="M11.828 2.25c-.916 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 01-.517.608 7.45 7.45 0 00-.478.198.798.798 0 01-.796-.064l-.453-.324a1.875 1.875 0 00-2.416.2l-.243.243a1.875 1.875 0 00-.2 2.416l.324.453a.798.798 0 01.064.796 7.448 7.448 0 00-.198.478.798.798 0 01-.608.517l-.55.092a1.875 1.875 0 00-1.566 1.849v.344c0 .916.663 1.699 1.567 1.85l.549.091c.281.047.508.25.608.517.06.162.127.321.198.478a.798.798 0 01-.064.796l-.324.453a1.875 1.875 0 00.2 2.416l.243.243c.648.648 1.67.733 2.416.2l.453-.324a.798.798 0 01.796-.064c.157.071.316.137.478.198.267.1.47.327.517.608l.092.55c.15.903.932 1.566 1.849 1.566h.344c.916 0 1.699-.663 1.85-1.567l.091-.549a.798.798 0 01.517-.608 7.52 7.52 0 00.478-.198.798.798 0 01.796.064l.453.324a1.875 1.875 0 002.416-.2l.243-.243c.648-.648.733-1.67.2-2.416l-.324-.453a.798.798 0 01-.064-.796c.071-.157.137-.316.198-.478.1-.267.327-.47.608-.517l.55-.091a1.875 1.875 0 001.566-1.85v-.344c0-.916-.663-1.699-1.567-1.85l-.549-.091a.798.798 0 01-.608-.517 7.507 7.507 0 00-.198-.478.798.798 0 01.064-.796l.324-.453a1.875 1.875 0 00-.2-2.416l-.243-.243a1.875 1.875 0 00-2.416-.2l-.453.324a.798.798 0 01-.796.064 7.462 7.462 0 00-.478-.198.798.798 0 01-.517-.608l-.091-.55a1.875 1.875 0 00-1.85-1.566h-.344zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      <div class="flex flex-wrap items-center">
        新闻源：
        <select
          v-model="source"
          class="rounded-md border border-black/20 bg-transparent px-1 transition-colors hover:border-blue-500"
          :disabled="loading"
          @change="handleSourceChange"
        >
          <option v-for="[game_id, game] in Object.entries(NEWS_LIST)" :key="game_id" :value="game_id">
            {{ game.displayName }}
          </option>
        </select>

        <select
          v-model="channal"
          class="my-1 ml-2 rounded-md border border-black/20 bg-transparent px-1 transition-colors hover:border-blue-500"
          :disabled="loading"
          @change="handleSourceChange"
        >
          <option v-for="[channal_id, channal_info] in Object.entries(NEWS_LIST[source].channals)" :key="channal_id" :value="channal_id">
            {{ channal_info.displayName }}
          </option>
        </select>
      </div>
      <div class="mb-2 flex flex-wrap items-center">
        数据更新于：
        <template v-if="loading">
          加载中
        </template>
        <template v-else>
          <span class="mr-2">
            {{ formatTime(newsUpdateTime) }}
          </span>
          <button class="flex items-center hover:text-blue-500" @click="fetchData(true)">
            <svg
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="size-4"
            >
              <path
                stroke-linecap="round" stroke-linejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
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
      <details v-show="!searchEnabled" class="mb-2" open>
        <summary>分类</summary>
        <ul class="mt-2 flex flex-wrap gap-1">
          <li
            v-for="tag in Object.keys(tags).sort((a, b) => tags[b] - tags[a])" :key="tag"
            class="inline-block cursor-pointer rounded-full border border-gray-400 px-2 py-0.5 text-xs transition-colors hover:border-blue-400 hover:text-blue-500 md:px-3 md:py-1 md:text-sm"
            :class="{
              '!border-blue-500 !bg-blue-500 !text-white': filterTag === tag,
            }"
            @click="handleClickTag(tag)"
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
          <input v-model="filterStartDate" type="date" class="rounded-md border border-black/20 bg-transparent px-1 transition-colors hover:border-blue-500" :max="filterEndDate">
        </span>

        <span>
          结束日期：
          <input v-model="filterEndDate" type="date" class="rounded-md border border-black/20 bg-transparent px-1 transition-colors hover:border-blue-500" :min="filterStartDate">
        </span>

        <button v-if="filterStartDate || filterEndDate" class="hover:text-blue-500" @click="filterStartDate = '';filterEndDate = ''">
          取消筛选
        </button>
      </div>

      <div v-show="searchEnabled" class="pb-2">
        <span class="pr-4">
          搜索结果：{{ sortedNewsData.length }}
        </span>
        <button class="hover:text-blue-500" @click="searchStr = ''">
          取消搜索
        </button>
      </div>
      <div v-if="loading" class="flex flex-col items-center gap-2 py-4">
        <svg viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" class="size-[60px]">
          <defs>
            <linearGradient id="a" x1="8.042%" y1="0%" x2="65.682%" y2="23.865%">
              <stop stop-color="#000" stop-opacity="0" offset="0%" />
              <stop stop-color="#000" stop-opacity=".631" offset="63.146%" />
              <stop stop-color="#000" offset="100%" />
            </linearGradient>
          </defs>
          <g fill="none" fill-rule="evenodd">
            <g transform="translate(1 1)">
              <path id="Oval-2" d="M36 18c0-9.94-8.06-18-18-18" stroke="url(#a)" stroke-width="2">
                <animateTransform
                  attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.9s"
                  repeatCount="indefinite"
                />
              </path>
              <circle fill="#000" cx="36" cy="18" r="1">
                <animateTransform
                  attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="0.9s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          </g>
        </svg>
        <span class="text-lg">数据加载中</span>
      </div>
      <ul
        ref="container"
        class="relative overflow-hidden"
        :style="{
          height: `${sortedNewsData.length * (itemHeight + 8) - 8}px`,
        }"
      >
        <NewsItem
          ref="shadowItem"
          :news="SHADOW_ITEM"
          :show-banner="showCover"
          :show-date-week="showDateWeek"
          :game="source"
          :channal="channal"
          :style="{ pointerEvent: 'none', userSelect: 'none' }"
        />
        <NewsItem
          v-for="news in itemRenderList" :key="news.id"
          :news="news"
          :show-banner="showCover"
          :show-date-week="showDateWeek"
          :game="source"
          :channal="channal"
        />
      </ul>
    </div>
  </div>
</template>

<style>
.popup-enter-active,
.popup-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: translate(10px, -10px) scale(0.9);
}
</style>
