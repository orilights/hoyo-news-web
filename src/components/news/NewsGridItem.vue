<script setup lang="ts">
import { storeToRefs } from 'pinia'
import LoadingIndicatorImage from '@/components/common/LoadingIndicatorImage.vue'
import { useNewsItem } from '@/composables/newsItem'
import { useMainStore } from '@/store/main'
import { formatDuration, formatTime, highlightText } from '@/utils'

const props = defineProps<{
  news: NewsData
  config: Omit<NewsItemConfig, 'coverSize'>
}>()

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
    class="group cursor-pointer"
    :href="channelConfig.newsDetailLink.replace('{id}', String(news.remoteId))"
    target="_blank"
    @click="openNews"
  >
    <div class="relative h-[120px] w-full overflow-hidden rounded-xl bg-slate-200">
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
        v-html="highlightText(news.title, searchKeywords)"
      />
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
