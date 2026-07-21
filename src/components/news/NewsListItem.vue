<script setup lang="ts">
import { LucideEllipsis } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import LoadingIndicatorImage from '@/components/common/LoadingIndicatorImage.vue'
import { useNewsItem } from '@/composables/newsItem'
import { useMainStore } from '@/store/main'
import { CoverSize } from '@/types/enum'
import { formatDuration, getWeek, highlightText } from '@/utils'

const props = defineProps<{
  news: NewsItemData
  config: NewsItemConfig
}>()

defineEmits(['changeFilter'])

const mainStore = useMainStore()

const { searchKeywords } = storeToRefs(mainStore)

const {
  channelConfig,
  coverThumbnailUrl,
  isNewsVisited,
  newsUrl,
  isLoadCover,
  isCoverLoaded,
  openNews,
  openVideo,
  openActionMenu: handleActionMenu,
  onImageLoaded,
} = useNewsItem({
  news: props.news,
})

const coverWidth = computed(() => {
  if (props.config.coverSize === CoverSize.Large) {
    return channelConfig.value.coverWidth
  }
  if (props.config.coverSize === CoverSize.Medium) {
    return (channelConfig.value.coverWidth) / 2
  }
  return 75
})
const coverHeight = computed(() => props.config.coverSize === CoverSize.Large ? 150 : 75)
</script>

<template>
  <li
    :style="{
      transform: `translateY(${news.top}px)`,
    }" class="absolute mb-2 w-full"
  >
    <a
      :href="newsUrl" :title="news.title"
      class="group flex rounded-md border-2 border-transparent bg-white p-2 transition-colors hover:border-blue-500 lg:p-3"
      target="_blank" @click="openNews"
    >
      <div
        v-if="config.showCover && channelConfig.coverWidth"
        class="relative mr-2 flex shrink-0 items-center justify-center lg:mr-4" :style="{
          width: `${coverWidth}px`,
          height: `${coverHeight}px`,
        }"
      >
        <LoadingIndicatorImage v-if="!isCoverLoaded" class="w-10" />
        <Transition name="fade">
          <img
            v-show="isCoverLoaded" :src="isLoadCover ? coverThumbnailUrl : ''"
            class="absolute size-full rounded-md bg-gray-100 object-cover sm:object-contain" alt="banner"
            referrerpolicy="no-referrer" @load="onImageLoaded"
          >
        </Transition>
      </div>
      <div class="flex min-w-0 flex-1 flex-col self-stretch">
        <h2
          :title="news.title" class="w-full truncate font-bold transition-colors lg:text-lg" :class="{
            'text-gray-400': config.showVisited && isNewsVisited,
          }" v-html="highlightText(news.title, searchKeywords)"
        />
        <div class="my-1 flex flex-wrap gap-x-2 gap-y-0.5 whitespace-nowrap text-xs lg:my-2 lg:text-sm">
          <div
            v-for="tag in news.tags"
            v-show="tag !== '未分类' && tag !== '未分类视频'"
            :key="tag"
            title="筛选此标签"
            class="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-1 py-0.5 text-xs text-gray-600 transition-colors hover:bg-slate-200 lg:px-2 lg:py-1 lg:text-sm"
            @click.stop.prevent="$emit('changeFilter', tag)"
          >
            <LucideTag class="size-4 p-0.5 lg:size-5" fill="currentColor" />
            <span class="max-w-[100px]">
              {{ tag }}
            </span>
          </div>
          <div
            v-if="news.tags.filter(t => t !== '未分类' && t !== '未分类视频').length === 0"
            title="筛选此标签"
            class="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-1 py-0.5 text-xs text-gray-600 transition-colors hover:bg-slate-200 lg:px-2 lg:py-1 lg:text-sm"
          >
            <LucideTag class="size-4 p-0.5 lg:size-5" fill="currentColor" />
            <span class="max-w-[100px]">
              未分类
            </span>
          </div>
          <div
            v-if="news.video" title="播放视频"
            class="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-1 py-0.5 text-xs text-gray-600 transition-colors hover:bg-slate-200 lg:px-2 lg:py-1 lg:text-sm"
            @click.stop.prevent="openVideo"
          >
            <LucideVideo class="size-4 p-0.5 lg:size-5" fill="currentColor" />
            <span v-if="news.video.duration">
              {{ formatDuration(news.video.duration) }}
            </span>
            <span v-else>
              未知时长
            </span>
          </div>
        </div>
        <div class="mt-auto flex flex-wrap gap-x-2 gap-y-0.5 whitespace-nowrap text-xs lg:text-sm">
          <div
            class="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-1 py-0.5 text-xs text-gray-600 lg:px-2 lg:py-1 lg:text-sm"
          >
            <LucideClock class="size-4 p-0.5 lg:size-5" />
            <span>
              {{ news.startTime }} <span v-if="config.showDateWeek">星期{{ getWeek(news.startTime) }}</span>
            </span>
          </div>
          <div
            title="更多操作"
            class="action-button flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 p-0.5 text-xs text-gray-600 transition-colors hover:bg-slate-200 lg:p-1 lg:text-sm"
            @click.stop.prevent="handleActionMenu"
          >
            <LucideEllipsis class="size-4 p-0.5 lg:size-5" />
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
