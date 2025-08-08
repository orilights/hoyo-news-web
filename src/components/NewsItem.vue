<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { useToast } from 'vue-toastification'
import LoadingIndicatorImage from '@/components/common/LoadingIndicatorImage.vue'
import IconTag from '@/components/icon/IconTag.vue'
import IconTime from '@/components/icon/IconTime.vue'
import IconVideo from '@/components/icon/IconVideo.vue'
import { DEFAULT_BANNER, LOAD_DELAY, NEWS_LIST } from '@/constants'
import { state } from '@/state'
import { CoverSize, VideoType } from '@/types/enum'
import { copyToClipboard, formatDuration, getMiyousheVideo, getWeek, sanitizeFilename } from '@/utils'

const props = defineProps<{
  news: NewsItemData
  source: string
  channal: string
  config: NewsItemConfig
}>()

const emit = defineEmits(['changeFilter', 'visit'])

let timer: NodeJS.Timeout | null = null
const newsKey = `${props.source}_${props.channal}_${props.news.remoteId}`

const actionMenuRef = ref<HTMLElement | null>(null)
const actionMenuWidth = useElementSize(actionMenuRef).width
const distanceToRight = ref(0)
const popupFromLeft = computed(() => distanceToRight.value < actionMenuWidth.value)

const loadImage = ref(false)
const imageLoaded = ref(false)
const showAction = ref(false)

const channalConfig = computed(() => NEWS_LIST[props.source].channals[props.channal])
const newsUrl = computed(() => channalConfig.value.newsDetailLink.replace('{id}', String(props.news.remoteId)))
const coverWidth = computed(() => {
  if (props.config.coverSize === CoverSize.Large) {
    return channalConfig.value.coverWidth
  }
  if (props.config.coverSize === CoverSize.Medium) {
    return (channalConfig.value.coverWidth) / 2
  }
  return 75
})
const coverHeight = computed(() => props.config.coverSize === CoverSize.Large ? 150 : 75)
const isNewsVisited = computed(() => state.newsVisited.has(newsKey))

onMounted(() => {
  if (state.imageLoaded.has(newsKey)) {
    loadImage.value = true
    return
  }
  timer = setTimeout(() => {
    loadImage.value = true
    timer = null
  }, LOAD_DELAY)
})

onUnmounted(() => {
  if (timer)
    clearTimeout(timer)
  // 确保组件销毁时移除事件监听器
  document.removeEventListener('click', closeAction)
})

function openVideo() {
  window.umami?.track('a-open-video', { key: newsKey })
  if (props.news.video?.type === VideoType.MIYOUSHE) {
    getMiyousheVideo(props.source, props.channal, props.news.video!.url)
      .then((videoUrl) => {
        window.open(videoUrl, '_blank')
      })
      .catch((err) => {
        useToast().error(err.message)
      })
  }
  else {
    window.open(props.news.video!.url, '_blank')
  }
}

function copyLink() {
  window.umami?.track('a-copy-news-link', { key: newsKey })
  copyToClipboard(newsUrl.value)
    .then(() => {
      useToast().success('已复制链接')
    })
    .catch((err) => {
      useToast().error(err?.message || '复制失败')
    })
}

function copyCoverLink() {
  window.umami?.track('a-copy-cover-link', { key: newsKey })
  copyToClipboard(props.news.coverUrl)
    .then(() => {
      useToast().success('已复制封面链接')
    })
    .catch((err) => {
      useToast().error(err?.message || '复制失败')
    })
}

async function copyVideoLink() {
  window.umami?.track('a-copy-video-link', { key: newsKey })

  let videoUrl = props.news.video!.url
  if (props.news.video?.type === VideoType.MIYOUSHE) {
    videoUrl = await getMiyousheVideo(props.source, props.channal, props.news.video!.url)
  }
  copyToClipboard(videoUrl)
    .then(() => {
      useToast().success('已复制视频链接')
    })
    .catch((err) => {
      useToast().error(err?.message || '复制失败')
    })
}

function sendToPotPlayer(link: string) {
  window.umami?.track('a-send-to-potplayer', { key: newsKey })
  window.open(`potplayer://${link}`)
}

function sendToAria2(link: string) {
  window.umami?.track('a-send-to-aria2', { key: newsKey })
  const rpcId = `HYN${new Date().getTime()}`
  const videoExt = link.split('.').pop()
  const videoOutName = sanitizeFilename(
    props.config.aria2Config.filename
      .replace('{newsTitle}', sanitizeFilename(props.news.title))
      .replace('{ext}', videoExt || 'mp4'),
  )
  fetch(props.config.aria2Config.rpcUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: rpcId,
      method: 'aria2.addUri',
      params: [`token:${props.config.aria2Config.rpcSecret}`, [link], {
        out: videoOutName,
      }],
    }),
  })
    .then(res => res.json())
    .then((data) => {
      if (data.error) {
        useToast().error(`aria2 返回错误：${data.error.message}`)
      }
      else {
        useToast().success('已发送至 aria2 RPC')
      }
    })
    .catch(() => {
      useToast().error('请求失败，请检测 aria2 配置')
    })
}

function onImageLoaded() {
  imageLoaded.value = true
  state.imageLoaded.add(newsKey)
}

function onClick() {
  window.umami?.track('a-visit-news', { key: newsKey })
  if (!props.config.showVisited)
    return
  state.newsVisited.add(newsKey)
  emit('visit')
}

function checkPopupDirection(target: HTMLElement | null) {
  if (!target)
    return
  target = target.closest('.action-button')
  const rect = (target as HTMLElement).getBoundingClientRect()
  distanceToRight.value = window.innerWidth - rect.right
}

function toggleAction(event: MouseEvent) {
  checkPopupDirection(event.target as HTMLElement)
  showAction.value = !showAction.value

  if (showAction.value) {
    nextTick(() => {
      document.addEventListener('click', closeAction)
    })
  }
  else {
    document.removeEventListener('click', closeAction)
  }
}

function closeAction() {
  showAction.value = false
  document.removeEventListener('click', closeAction)
}
</script>

<template>
  <li
    :style="{
      transform: `translateY(${news.top}px)`,
    }"
    class="absolute mb-2 w-full"
  >
    <a
      :href="newsUrl"
      :title="news.title"
      class="group flex rounded-md border-2 border-transparent bg-white p-2 transition-colors hover:border-blue-500 sm:p-3"
      target="_blank"
      @click="onClick"
    >
      <div
        v-if="config.showBanner && channalConfig.coverWidth"
        class="relative mr-2 flex shrink-0 items-center justify-center md:mr-4"
        :style="{
          width: `${coverWidth}px`,
          height: `${coverHeight}px`,
        }"
      >
        <LoadingIndicatorImage
          v-if="!imageLoaded"
          class="w-10"
        />
        <Transition name="fade">
          <img
            v-show="imageLoaded"
            :src="loadImage ? (news.coverUrl || DEFAULT_BANNER) : ''"
            class="absolute size-full rounded-md bg-gray-100 object-cover sm:object-contain"
            alt="banner"
            referrerpolicy="no-referrer"
            @load="onImageLoaded"
          >
        </Transition>
      </div>
      <div class="flex min-w-0 flex-1 flex-col self-stretch">
        <h2
          :title="news.title"
          class="w-full truncate font-bold transition-colors md:text-lg"
          :class="{
            'text-gray-400': config.showVisited && isNewsVisited,
          }"
        >
          {{ news.title }}
        </h2>
        <div class="my-1 flex flex-wrap gap-x-2 gap-y-0.5 whitespace-nowrap text-xs md:my-2 md:text-sm">
          <div
            title="筛选此标签"
            class="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-1 py-0.5 text-xs text-gray-600 transition-colors hover:bg-slate-200 md:px-2 md:py-1 md:text-sm"
            @click.stop.prevent="$emit('changeFilter', news.tag)"
          >
            <IconTag class="size-4 p-0.5 md:size-5" />
            <span class="max-w-[100px]">
              {{ news.tag }}
            </span>
          </div>
          <div
            v-if="news.video"
            title="播放视频"
            class="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-1 py-0.5 text-xs text-gray-600 transition-colors hover:bg-slate-200 md:px-2 md:py-1 md:text-sm"
            @click.stop.prevent="openVideo"
          >
            <IconVideo class="size-4 p-0.5 md:size-5" />
            <span v-if="news.video.duration">
              {{ formatDuration(news.video.duration) }}
            </span>
            <span v-else>
              未知时长
            </span>
          </div>
        </div>
        <div class="mt-auto flex flex-wrap gap-x-2 gap-y-0.5 whitespace-nowrap text-xs md:text-sm">
          <div class="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-1 py-0.5 text-xs text-gray-600 md:px-2 md:py-1 md:text-sm">
            <IconTime class="size-4 p-0.5 md:size-5" />
            <span>
              {{ news.startTime }} <span v-if="config.showDateWeek">星期{{ getWeek(news.startTime) }}</span>
            </span>
          </div>
          <div
            title="更多操作"
            class="action-button relative flex items-center gap-1 rounded-full border border-slate-200  p-0.5 text-xs text-gray-600 transition-colors hover:bg-slate-200 md:p-1 md:text-sm"
            :class="{
              'bg-slate-200': showAction,
              'bg-slate-100': !showAction,
            }"
            @click.stop.prevent="toggleAction"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4 p-0.5 md:size-5">
              <path d="M3 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM8.5 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM15.5 8.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
            </svg>
            <Transition name="fade">
              <div
                v-show="showAction"
                ref="actionMenuRef"
                class="absolute bottom-0 z-30 w-fit overflow-hidden rounded-md border bg-white text-black"
                :style="{
                  left: popupFromLeft ? `-${actionMenuWidth + 8}px` : undefined,
                  right: popupFromLeft ? undefined : `-${actionMenuWidth + 8}px`,
                }"
                @click.stop.prevent
              >
                <button
                  class="block w-full px-2 py-0.5 text-left transition-colors hover:bg-black/10"
                  title="复制新闻链接至剪贴板"
                  @click="showAction = false;copyLink()"
                >
                  复制链接
                </button>
                <button
                  v-if="news.coverUrl"
                  class="block w-full px-2 py-0.5 text-left transition-colors hover:bg-black/10"
                  title="复制封面链接至剪贴板"
                  @click="showAction = false;copyCoverLink()"
                >
                  复制封面链接
                </button>
                <button
                  v-if="news.video"
                  class="block w-full px-2 py-0.5 text-left transition-colors hover:bg-black/10"
                  title="复制视频链接至剪贴板"
                  @click="showAction = false;copyVideoLink()"
                >
                  复制视频链接
                </button>
                <button
                  v-if="news.video"
                  class="block w-full px-2 py-0.5 text-left transition-colors hover:bg-black/10"
                  title="在 PotPlayer 中打开视频"
                  @click="showAction = false;sendToPotPlayer(news.video.url)"
                >
                  在 PotPlayer 中打开视频
                </button>
                <button
                  v-if="news.video"
                  class="block w-full px-2 py-0.5 text-left transition-colors hover:bg-black/10"
                  title="将视频发送至 aria2 下载"
                  @click="showAction = false;sendToAria2(news.video.url)"
                >
                  将视频发送至 aria2 下载
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </a>
  </li>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
