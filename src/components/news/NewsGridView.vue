<script setup lang="ts">
import { useWindowVirtualizer } from '@tanstack/vue-virtual'
import { useElementSize } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import NewsGridItem from '@/components/news/NewsGridItem.vue'
import {
  GRID_COLUMN_COUNT_DEFAULT,
  GRID_COLUMN_COUNT_MIN,
  GRID_ITEM_GAP,
  NEWS_LIST,
} from '@/constants'
import { useMainStore } from '@/store/main'
import { useSettingsStore } from '@/store/settings'

const mainStore = useMainStore()
const settings = useSettingsStore()

const { newsDataFiltered, currentSource, currentChannel } = storeToRefs(mainStore)
const { newsItemConfig, gridCardMinWidth, gridCoverMode, showCover } = storeToRefs(settings)
const parentRef = ref<HTMLElement>()
const { width: containerWidth } = useElementSize(parentRef)

const columnCount = ref(GRID_COLUMN_COUNT_DEFAULT)

function updateColumnCount() {
  const availableWidth = containerWidth.value - GRID_ITEM_GAP * 2
  const itemMinWidth = gridCardMinWidth.value
  const columns = Math.floor(availableWidth / (itemMinWidth + GRID_ITEM_GAP))
  columnCount.value = Math.max(GRID_COLUMN_COUNT_MIN, columns)
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
  estimateSize: () => {
    const contentHeight = 106
    const channelCoverWidth = NEWS_LIST[currentSource.value]?.channels[currentChannel.value]?.coverWidth ?? 0
    if (!channelCoverWidth || !showCover.value) {
      // 封面隐藏时，只计算内容区高度
      return contentHeight
    }
    if (gridCoverMode.value === 'square') {
      const cols = Math.max(columnCount.value, 1)
      const cardWidth = (containerWidth.value - GRID_ITEM_GAP * (cols - 1)) / cols
      return cardWidth + contentHeight
    }
    return 224
  },
  overscan: 3,
  gap: GRID_ITEM_GAP,
  get scrollMargin() {
    return parentRef.value?.offsetTop || 0
  },
})

watch(containerWidth, updateColumnCount, { immediate: true })
watch(containerWidth, virtualizer.value.measure)
watch(gridCoverMode, virtualizer.value.measure)
watch(gridCardMinWidth, updateColumnCount)
watch([currentChannel, showCover], virtualizer.value.measure)

onMounted(() => {
  nextTick(() => {
    updateColumnCount()
  })
})
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
          class="grid gap-4" :style="{
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
