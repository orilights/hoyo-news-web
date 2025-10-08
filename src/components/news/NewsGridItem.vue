<script setup lang="ts">
import LoadingIndicatorImage from '@/components/common/LoadingIndicatorImage.vue'
import { DEFAULT_BANNER, LOAD_DELAY, NEWS_LIST } from '@/constants'
import { useMainStore } from '@/store/main'
import { formatDuration, formatTime } from '@/utils'

const props = defineProps<{
  news: NewsData
  source: string
  channel: string
  config: Omit<NewsItemConfig, 'coverSize'>
}>()

const mainStore = useMainStore()

let timer: NodeJS.Timeout | null = null
const newsKey = `${props.source}_${props.channel}_${props.news.remoteId}`

const loadImage = ref(false)
const imageLoaded = ref(false)

const channelConfig = computed(() => NEWS_LIST[props.source].channels[props.channel])
const isNewsVisited = computed(() => mainStore.isNewsVisited(newsKey))

onMounted(() => {
  if (mainStore.imageLoaded.has(newsKey)) {
    loadImage.value = true
    imageLoaded.value = true
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
})

function onImageLoaded() {
  imageLoaded.value = true
  mainStore.imageLoaded.add(newsKey)
}

function onClick() {
  window.umami?.track('a-visit-news', { key: newsKey })
  if (!props.config.showVisited)
    return
  mainStore.setNewsVisited(newsKey)
}
</script>

<template>
  <a
    class="group cursor-pointer"
    :href="channelConfig.newsDetailLink.replace('{id}', String(news.remoteId))"
    target="_blank"
    @click="onClick"
  >
    <div class="relative h-[120px] w-full overflow-hidden rounded-xl bg-slate-200">
      <div v-if="news.video?.duration" class="absolute bottom-2 right-2 z-[5] rounded-md bg-black/60 px-1 text-xs text-white opacity-80 transition-opacity group-hover:opacity-100">
        {{ formatDuration(news.video.duration) }}
      </div>
      <div class="absolute inset-0 flex items-center justify-center">
        <LoadingIndicatorImage
          v-if="!imageLoaded"
          class="w-8 opacity-50"
        />
      </div>
      <Transition name="fade">
        <img
          v-show="imageLoaded"
          :src="loadImage ? (news.coverUrl || DEFAULT_BANNER) : ''"
          class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          alt="banner"
          referrerpolicy="no-referrer"
          @load="onImageLoaded"
        >
      </Transition>
    </div>
    <div class="mt-1 px-1">
      <div
        class="line-clamp-2 h-[32px] text-xs font-bold"
        :class="{
          'text-gray-400': config.showVisited && isNewsVisited,
        }"
        :title="news.title"
      >
        {{ news.title }}
      </div>
      <div class="mt-1 text-xs text-gray-500">
        {{ formatTime(news.startTime, true) }}
      </div>
    </div>
  </a>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
