<script setup lang="ts">
import { useWindowVirtualizer } from '@tanstack/vue-virtual'
import { useElementSize } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import NewsGridItem from '@/components/news/NewsGridItem.vue'
import {
  GRID_COLUMN_COUNT_DEFAULT,
  GRID_COLUMN_COUNT_MIN,
  NEWS_LIST,
} from '@/constants'
import { useMainStore } from '@/store/main'
import { useSettingsStore } from '@/store/settings'
import { event } from '@/utils'

const toast = useToast()
const mainStore = useMainStore()
const settings = useSettingsStore()

const { newsDataFiltered, sortBy, currentSource, currentChannel, isMobile } = storeToRefs(mainStore)
const { newsItemConfig, gridCardMinWidth, gridCoverMode, showCover } = storeToRefs(settings)
const parentRef = ref<HTMLElement>()
const { width: containerWidth } = useElementSize(parentRef)

const columnCount = ref(GRID_COLUMN_COUNT_DEFAULT)

const itemGap = computed(() => isMobile.value ? 8 : 16)

function updateColumnCount() {
  const availableWidth = containerWidth.value - itemGap.value * 2
  const itemMinWidth = gridCardMinWidth.value
  const columns = Math.floor(availableWidth / (itemMinWidth + itemGap.value))
  columnCount.value = Math.max(GRID_COLUMN_COUNT_MIN, columns)
}

function getRowHeight() {
  const contentHeight = 106
  const channelCoverWidth = NEWS_LIST[currentSource.value]?.channels[currentChannel.value]?.coverWidth ?? 0
  if (!channelCoverWidth || !showCover.value) {
    return contentHeight
  }
  if (gridCoverMode.value === 'square') {
    const cols = Math.max(columnCount.value, 1)
    const cardWidth = (containerWidth.value - itemGap.value * (cols - 1)) / cols
    return cardWidth + contentHeight
  }
  return contentHeight + 120
}

const rows = computed(() => {
  const result = []
  for (let i = 0; i < newsDataFiltered.value.length; i += columnCount.value) {
    result.push(newsDataFiltered.value.slice(i, i + columnCount.value))
  }
  return result
})

const virtualizer = useWindowVirtualizer({
  get count() {
    return rows.value.length
  },
  estimateSize: () => getRowHeight(),
  overscan: 3,
  get gap() {
    return itemGap.value
  },
  get scrollMargin() {
    return parentRef.value?.offsetTop || 0
  },
})

watch(containerWidth, updateColumnCount, { immediate: true })
watch(gridCardMinWidth, updateColumnCount)
watch([containerWidth, gridCoverMode, currentChannel, showCover, isMobile], virtualizer.value.measure)

onMounted(() => {
  nextTick(() => {
    updateColumnCount()
  })
  event.on('scrollByDate', handleScrollByDate)
})

onUnmounted(() => {
  event.off('scrollByDate', handleScrollByDate)
})

function handleScrollByDate(date: unknown) {
  if (!scrollByDate(date as string)) {
    toast.error('未找到跳转目标')
  }
}

function scrollByDate(date: string) {
  const data = newsDataFiltered.value
  let target: NewsData | undefined
  if (sortBy.value === 'desc') {
    target = data.find(news => new Date(news.startTime) <= new Date(`${date} 23:59:59`))
    if (!target) {
      target = data.at(-1)
    }
  }
  else {
    target = data.find(news => new Date(news.startTime) >= new Date(`${date} 00:00:00`))
    if (!target) {
      target = data.at(-1)
    }
  }
  if (target) {
    const itemIndex = data.indexOf(target)
    const rowIndex = Math.floor(itemIndex / columnCount.value)

    const rowHeight = getRowHeight()
    const marginTop = parentRef.value?.offsetTop || 0
    const rowOffset = rowIndex * (rowHeight + itemGap.value)
    const targetScrollY = marginTop + rowOffset - window.innerHeight / 2 + rowHeight / 2

    window.scrollTo({ top: Math.max(0, targetScrollY), behavior: 'smooth' })
    return true
  }
  return false
}
</script>

<template>
  <div ref="parentRef">
    <div
      :style="{
        height: `${virtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }"
    >
      <div
        v-for="virtualRow in virtualizer.getVirtualItems()" :key="virtualRow.index"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${virtualRow.size}px`,
          transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
        }"
      >
        <div
          class="grid gap-2 md:gap-4" :style="{
            gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
          }"
        >
          <NewsGridItem
            v-for="item in rows[virtualRow.index]" :key="item.remoteId"
            :news="item"
            :config="newsItemConfig"
            @change-filter="mainStore.changeTag"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
