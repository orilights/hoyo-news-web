<script setup lang="ts">
import { storeToRefs } from 'pinia'
import LoadingIndicator from '@/components/common/LoadingIndicator.vue'
import SearchResultItem from '@/components/news/SearchResultItem.vue'
import { NEWS_LIST } from '@/constants'
import { useMainStore } from '@/store/main'

const mainStore = useMainStore()
const { searchResults, searchLoading, searchQuery, searchError } = storeToRefs(mainStore)

function getLinkTemplate(sourceKey: string): string {
  const [source, ...channelParts] = sourceKey.split('.')
  const channel = channelParts.join('.')
  const sourceInfo = NEWS_LIST[source]
  const channelInfo = sourceInfo?.channels[channel]
  return channelInfo?.newsDetailLink ?? '#'
}

function handleOpen(result: SearchResult) {
  mainStore.openSearchResult(result)
}
</script>

<template>
  <div class="py-2">
    <div v-if="searchLoading" class="flex flex-col items-center gap-2 py-16">
      <LoadingIndicator class="size-[40px]" />
      <span class="text-sm text-gray-500">搜索中...</span>
    </div>

    <div v-else-if="searchError" class="py-16 text-center text-sm text-red-500">
      {{ searchError }}
    </div>

    <template v-else-if="searchQuery">
      <div v-if="searchResults.length === 0" class="py-16 text-center text-sm text-gray-400">
        未找到结果
      </div>

      <ul v-else class="space-y-2">
        <SearchResultItem
          v-for="result in searchResults"
          :key="result.remoteId"
          :result="result"
          :link-template="getLinkTemplate(result.sourceKey)"
          @open="handleOpen"
        />
      </ul>
    </template>

    <div v-else class="py-16 text-center text-sm text-gray-400">
      输入关键词并开启全文搜索
    </div>
  </div>
</template>
