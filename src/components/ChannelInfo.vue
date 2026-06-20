<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/store/main'
import { useSettingsStore } from '@/store/settings'
import { formatTime } from '@/utils'

const mainStore = useMainStore()
const settingsStore = useSettingsStore()

const {
  newsLoading,
  newsUpdateTime,
  channelConfig,
  showRssInfo,
  newsDataFiltered,
  newsData,
  sortBy,
} = storeToRefs(mainStore)

const { useGridView } = storeToRefs(settingsStore)

function toggleSort() {
  mainStore.sortBy = mainStore.sortBy === 'desc' ? 'asc' : 'desc'
}

function toggleViewMode() {
  settingsStore.useGridView = !settingsStore.useGridView
}
</script>

<template>
  <div class="mb-2 flex flex-wrap items-center gap-2 text-sm">
    <span v-if="newsData.length">
      {{ newsDataFiltered.length }} / {{ newsData.length }}
    </span>

    <span class="flex items-center">
      <LucideHistory class="mr-1 size-4" />
      <template v-if="newsLoading">
        加载中
      </template>
      <template v-else>
        <span>
          {{ newsUpdateTime ? formatTime(newsUpdateTime) : '无数据' }}
        </span>
        <button v-if="channelConfig.allowForceRefresh !== false" class="ml-2 flex items-center hover:text-blue-500" @click="mainStore.fetchData(true)">
          <LucideRefreshCw class="size-4" />
          <span class="ml-1">
            刷新数据
          </span>
        </button>
      </template>
    </span>

    <button
      class="flex items-center hover:text-blue-500"
      :title="useGridView ? '当前为网格视图，点击切换为列表视图' : '当前为列表视图，点击切换为网格视图'"
      @click="toggleViewMode"
    >
      <LucideLayoutGrid v-if="useGridView" class="size-4" />
      <LucideLayoutList v-else class="size-4" />
      <span class="ml-1">
        {{ useGridView ? '网格' : '列表' }}
      </span>
    </button>

    <button
      class="flex items-center hover:text-blue-500"
      :title="sortBy === 'desc' ? '当前为降序，点击切换为升序' : '当前为升序，点击切换为降序'"
      @click="toggleSort"
    >
      <LucideArrowDown10 v-if="sortBy === 'desc'" class="size-4" />
      <LucideArrowUp01 v-else class="size-4" />
      <span class="ml-1">
        {{ sortBy === 'desc' ? '降序' : '升序' }}
      </span>
    </button>

    <button v-if="channelConfig.rss !== false" class="hover:text-blue-500" @click="showRssInfo = true">
      <LucideRss class="size-4" />
    </button>
  </div>
</template>

<style scoped>

</style>
