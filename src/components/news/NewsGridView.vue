<script setup lang="ts">
import { useWindowVirtualizer } from '@tanstack/vue-virtual'
import { useElementSize } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import NewsGridItem from '@/components/news/NewsGridItem.vue'
import {
  GRID_COLUMN_COUNT_DEFAULT,
  GRID_COLUMN_COUNT_MIN,
  GRID_ITEM_GAP,
  GRID_ITEM_WIDTH_MIN,
  GRID_ROW_HEIGHT,
} from '@/constants'
import { useMainStore } from '@/store/main'
import { useSettingsStore } from '@/store/settings'

const mainStore = useMainStore()
const settings = useSettingsStore()

const { currentSource, currentChannel, newsDataFiltered } = storeToRefs(mainStore)
const { newsItemConfig } = storeToRefs(settings)
const parentRef = ref<HTMLElement>()

const columnCount = ref(GRID_COLUMN_COUNT_DEFAULT)

function updateColumnCount() {
  if (!parentRef.value)
    return
  const containerWidth = parentRef.value.offsetWidth
  const availableWidth = containerWidth - GRID_ITEM_GAP * 2
  const columns = Math.floor(availableWidth / (GRID_ITEM_WIDTH_MIN + GRID_ITEM_GAP))
  columnCount.value = Math.max(GRID_COLUMN_COUNT_MIN, columns)
}

const rows = computed(() => {
  const result = []
  for (let i = 0; i < newsDataFiltered.value.length; i += columnCount.value) {
    result.push(newsDataFiltered.value.slice(i, i + columnCount.value))
  }
  return result
})

const { width } = useElementSize(parentRef)
watch(width, updateColumnCount, { immediate: true })

const virtualizer = useWindowVirtualizer({
  get count() {
    return rows.value.length
  },
  estimateSize: () => GRID_ROW_HEIGHT,
  overscan: 1,
  get scrollMargin() {
    return parentRef.value?.offsetTop || 0
  },
})

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
            :source="currentSource"
            :channel="currentChannel"
            :config="newsItemConfig"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
