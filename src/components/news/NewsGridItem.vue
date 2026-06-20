<script setup lang="ts">
import { storeToRefs } from 'pinia'
import LoadingIndicatorImage from '@/components/common/LoadingIndicatorImage.vue'
import { useNewsItem } from '@/composables/newsItem'
import { useMainStore } from '@/store/main'
import { formatDuration, formatTime, getWeek, highlightText } from '@/utils'

const props = defineProps<{
  news: NewsData
  config: Omit<NewsItemConfig, 'coverSize'>
}>()

defineEmits(['changeFilter'])

const mainStore = useMainStore()

const { searchKeywords } = storeToRefs(mainStore)

const {
  channelConfig,
  coverThumbnailUrl,
  isNewsVisited,
  isLoadCover,
  isCoverLoaded,
  openNews,
  onImageLoaded,
} = useNewsItem({
  news: props.news,
})
</script>

<template>
  <a
    class="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-blue-400 hover:shadow-md"
    :href="channelConfig.newsDetailLink.replace('{id}', String(news.remoteId))"
    target="_blank"
    @click="openNews"
  >
    <div
      class="relative w-full overflow-hidden bg-slate-200"
      :class="config.coverMode === 'square' ? 'aspect-square' : 'h-[120px]'"
    >
      <div v-if="news.video?.duration" class="absolute bottom-2 right-2 z-[5] rounded-md bg-black/60 px-1 text-xs text-white opacity-80 transition-opacity group-hover:opacity-100">
        {{ formatDuration(news.video.duration) }}
      </div>
      <div class="absolute inset-0 flex items-center justify-center">
        <LoadingIndicatorImage
          v-if="!isCoverLoaded"
          class="w-8 opacity-50"
        />
      </div>
      <Transition name="fade">
        <img
          v-show="isCoverLoaded"
          :src="isLoadCover ? coverThumbnailUrl : ''"
          class="size-full transition-transform duration-300 group-hover:scale-105"
          :class="config.coverMode === 'square' ? 'object-contain' : 'object-cover'"
          alt="banner"
          referrerpolicy="no-referrer"
          @load="onImageLoaded"
        >
      </Transition>
    </div>
    <div class="flex flex-1 flex-col p-2">
      <div
        class="line-clamp-2 h-[39px] text-xs font-bold leading-relaxed"
        :class="{
          'text-gray-400': config.showVisited && isNewsVisited,
        }"
        :title="news.title"
        v-html="highlightText(news.title, searchKeywords)"
      />
      <div class="mt-1.5 flex flex-wrap items-center gap-1 text-xs text-gray-500">
        <div
          v-if="news.tag"
          class="inline-flex items-center gap-0.5 rounded-full border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs text-gray-600"
          @click.stop.prevent="$emit('changeFilter', news.tag)"
        >
          <LucideTag class="size-3 shrink-0" />
          <span class="max-w-[80px] truncate">{{ news.tag }}</span>
        </div>
      </div>
      <div class="mt-auto flex items-center gap-1 pt-1.5 text-xs text-gray-400">
        <LucideClock class="size-3 shrink-0" />
        <span>{{ formatTime(news.startTime, true) }}</span>
        <span v-if="config.showDateWeek">星期{{ getWeek(news.startTime) }}</span>
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
