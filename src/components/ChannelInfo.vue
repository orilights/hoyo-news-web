<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/store/main'
import { formatTime } from '@/utils'

const mainStore = useMainStore()

const {
  newsLoading,
  newsUpdateTime,
  channelConfig,
  showRssInfo,
  newsDataFiltered,
  newsData,
} = storeToRefs(mainStore)
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

    <button v-if="channelConfig.rss !== false" class="hover:text-blue-500" @click="showRssInfo = true">
      <LucideRss class="size-4" />
    </button>
  </div>
</template>

<style scoped>

</style>
