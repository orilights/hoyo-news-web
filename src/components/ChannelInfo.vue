<script setup lang="ts">
import { storeToRefs } from 'pinia'
import IconRefresh from '@/components/icon/IconRefresh.vue'
import IconRss from '@/components/icon/IconRss.vue'
import IconUpdateTime from '@/components/icon/IconUpdateTime.vue'
import { useMainStore } from '@/store/main'
import { formatTime } from '@/utils'

const mainStore = useMainStore()

const {
  currentSource,
  currentChannel,
  newsLoading,
  newsUpdateTime,
  channelConfig,
} = storeToRefs(mainStore)

function openRssLink() {
  const apiBase = channelConfig.value.apiBase
  const rssUrl = `${apiBase}/news/feed/${currentSource.value}.${currentChannel.value}`
  window.open(rssUrl, '_blank')
}
</script>

<template>
  <div class="mb-2 flex flex-wrap items-center">
    <IconUpdateTime class="mr-1 size-4" />
    <template v-if="newsLoading">
      加载中
    </template>
    <template v-else>
      <span>
        {{ newsUpdateTime ? formatTime(newsUpdateTime) : '无数据' }}
      </span>
      <button v-if="channelConfig.allowForceRefresh !== false" class="ml-2 flex items-center hover:text-blue-500" @click="mainStore.fetchData(true)">
        <IconRefresh class="size-4" />
        <span class="ml-1">
          刷新数据
        </span>
      </button>
    </template>
    <button v-if="channelConfig.rss !== false" class="ml-2 hover:text-blue-500" @click="openRssLink">
      <IconRss class="size-4" />
    </button>
  </div>
</template>

<style scoped>

</style>
