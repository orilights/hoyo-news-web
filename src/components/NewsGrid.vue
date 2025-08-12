<script setup lang="ts">
import { DEFAULT_BANNER, NEWS_LIST } from '@/constants'
import { state } from '@/state'
import { formatDuration, formatTime } from '@/utils'

const props = defineProps<{
  config: NewsItemConfig
  source: string
  channel: string
  news: NewsData[]
  sortBy: 'asc' | 'desc'
}>()

const emit = defineEmits(['visit'])

const channelConfig = computed(() => NEWS_LIST[props.source].channels[props.channel])

function onClick(news: NewsData) {
  const newsKey = `${props.source}_${props.channel}_${news.remoteId}`
  window.umami?.track('a-visit-news', { key: newsKey })
  if (!props.config.showVisited)
    return
  state.newsVisited.add(newsKey)
  emit('visit')
}
</script>

<template>
  <div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
    <a
      v-for="item in news" :key="item.remoteId" class="group cursor-pointer"
      :href="channelConfig.newsDetailLink.replace('{id}', String(item.remoteId))" target="_blank"
      @click="onClick(item)"
    >
      <div class="relative h-[120px] w-full overflow-hidden rounded-xl bg-slate-200">
        <div v-if="item.video?.duration" class="absolute bottom-2 right-2 z-[5] rounded-md bg-black/60 px-1 text-xs text-white opacity-80 transition-opacity group-hover:opacity-100">
          {{ formatDuration(item.video.duration) }}
        </div>
        <img
          class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          :src="item.coverUrl || DEFAULT_BANNER"
          loading="lazy"
        >
      </div>
      <div class="mt-1 px-1">
        <div class="line-clamp-2 h-[32px] text-xs font-bold text-black" :title="item.title">
          {{ item.title }}
        </div>
        <div class="mt-1 text-xs text-gray-500">
          {{ formatTime(item.startTime, true) }}
        </div>
      </div>
    </a>
  </div>
</template>

<style scoped>
</style>
