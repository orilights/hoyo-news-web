<script setup lang="ts">
import { useElementBounding, useElementSize, useThrottle } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import NewsListItem from '@/components/news/NewsListItem.vue'
import { useCoverSize } from '@/composables/cover'
import { ITEM_GAP, SHADOW_ITEM } from '@/constants'
import { useMainStore } from '@/store/main'
import { useSettingsStore } from '@/store/settings'
import { event } from '@/utils'

const toast = useToast()
const mainStore = useMainStore()
const settingsStore = useSettingsStore()

const { currentSource, currentChannel, newsDataFiltered, sortBy } = storeToRefs(mainStore)
const { newsItemConfig } = storeToRefs(settingsStore)
const { coverSize } = useCoverSize()

const config = computed(() => ({
  ...newsItemConfig.value,
  coverSize: coverSize.value,
}))
const containerRef = ref<HTMLElement>()
const shadowItemRef = ref<HTMLElement>()
const containerTop = useThrottle(useElementBounding(containerRef).top, 30, true)
const newsItemHeight = useElementSize(shadowItemRef).height

const newsList = computed(() => {
  const list: NewsItemData[] = []
  newsDataFiltered.value.forEach((v, i) => {
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

onMounted(() => {
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
  let target
  if (sortBy.value === 'desc') {
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
</script>

<template>
  <ul
    ref="containerRef"
    class="relative overflow-hidden"
    :style="{
      height: `${newsDataFiltered.length * (newsItemHeight + ITEM_GAP)}px`,
    }"
  >
    <NewsListItem
      ref="shadowItemRef"
      :news="SHADOW_ITEM"
      :source="currentSource"
      :channel="currentChannel"
      :config="config"
      :style="{ pointerEvent: 'none', userSelect: 'none' }"
    />
    <NewsListItem
      v-for="news_data in renderList" :key="news_data.remoteId"
      :news="news_data"
      :source="currentSource"
      :channel="currentChannel"
      :config="config"
      @change-filter="mainStore.changeTag"
    />
  </ul>
</template>
