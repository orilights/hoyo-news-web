<script setup lang="ts">
import { useElementBounding, useElementSize, useThrottle } from '@vueuse/core'
import NewsItem from '@/components/NewsItem.vue'
import { ITEM_GAP, SHADOW_ITEM, VISIT_PERSIST_KEY } from '@/constants'
import { state } from '@/state'
import { limitSetSize } from '@/utils'

const props = defineProps<{
  config: NewsItemConfig
  source: string
  channel: string
  news: NewsData[]
  sortBy: 'asc' | 'desc'
}>()

defineEmits(['changeFilter', 'visit'])

defineExpose({ scrollByDate })

const containerRef = ref<HTMLElement>()
const shadowItemRef = ref<HTMLElement>()
const containerTop = useThrottle(useElementBounding(containerRef).top, 30, true)
const newsItemHeight = useElementSize(shadowItemRef).height

const newsList = computed(() => {
  const list: NewsItemData[] = []
  props.news.forEach((v, i) => {
    list.push({
      ...v,
      top: (newsItemHeight.value + ITEM_GAP) * i,
    })
  })
  return list
})
const renderList = computed(() => {
  const renderRange = {
    up: 0.5,
    down: 0.5,
  }
  const renderRangeTop = -containerTop.value - renderRange.up * window.innerHeight
  const renderRangeBottom = -containerTop.value + window.innerHeight + renderRange.down * window.innerHeight

  return newsList.value.filter((item) => {
    return (item.top + newsItemHeight.value > renderRangeTop && item.top < renderRangeBottom)
  })
})

function scrollByDate(date: string) {
  let target
  if (props.sortBy === 'desc') {
    target = newsList.value.find(news => new Date(news.startTime) <= new Date(`${date} 23:59:59`))
    if (!target) {
      target = newsList.value[newsList.value.length - 1]
    }
  }
  else {
    target = newsList.value.find(news => new Date(news.startTime) >= new Date(`${date} 00:00:00`))
    if (!target) {
      target = newsList.value[newsList.value.length - 1]
    }
  }
  if (target) {
    const containerTop = containerRef.value?.offsetTop || 0
    const offsetTop = window.innerHeight / 2 - newsItemHeight.value / 2
    window.document.documentElement.scrollTo({ top: containerTop + target.top - offsetTop, behavior: 'smooth' })
    return true
  }
  return false
}

function handlePerisitVisitRecord() {
  if (!props.config.showVisited)
    return
  limitSetSize(state.newsVisited, 2000)
  localStorage.setItem(VISIT_PERSIST_KEY, JSON.stringify(Array.from(state.newsVisited)))
}
</script>

<template>
  <ul
    ref="containerRef"
    class="relative overflow-hidden"
    :style="{
      height: `${news.length * (newsItemHeight + ITEM_GAP)}px`,
    }"
  >
    <NewsItem
      ref="shadowItemRef"
      :news="SHADOW_ITEM"
      :source="source"
      :channel="channel"
      :config="config"
      :style="{ pointerEvent: 'none', userSelect: 'none' }"
    />
    <NewsItem
      v-for="news_data in renderList" :key="news_data.remoteId"
      :news="news_data"
      :source="source"
      :channel="channel"
      :config="config"
      @change-filter="$emit('changeFilter', $event)"
      @visit="handlePerisitVisitRecord"
    />
  </ul>
</template>
