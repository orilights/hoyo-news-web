<script setup lang="ts">
import { DEFAULT_BANNER, NEWS_LIST } from '@/constants'
import { state } from '@/state'
import { formatDuration, formatTime } from '@/utils'

const props = defineProps<{
  config: NewsItemConfig
  source: string
  channal: string
  news: NewsData[]
  sortBy: 'asc' | 'desc'
}>()

const emit = defineEmits(['visit'])

const channalConfig = computed(() => NEWS_LIST[props.source].channals[props.channal])

function onClick(news: NewsData) {
  const newsKey = `${props.source}_${props.channal}_${news.id}`
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
      v-for="item in news" :key="item.id" class="group cursor-pointer"
      :href="channalConfig.newsDetailLink.replace('{id}', String(item.id))" target="_blank"
      @click="onClick(item)"
    >
      <div class="relative h-[120px] w-full overflow-hidden rounded-xl bg-slate-200">
        <div v-if="item.duration" class="absolute bottom-2 right-2 z-10 rounded-md bg-black/60 px-1 text-sm text-white opacity-80 transition-opacity group-hover:opacity-100">
          {{ formatDuration(item.duration) }}
        </div>
        <img
          class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          :src="item.cover || DEFAULT_BANNER"
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
