<script setup lang="ts">
import { storeToRefs } from 'pinia'
import IconRefresh from '@/components/icon/IconRefresh.vue'
import IconRss from '@/components/icon/IconRss.vue'
import IconUpdateTime from '@/components/icon/IconUpdateTime.vue'
import RssInfo from '@/components/RssInfo.vue'
import { useMainStore } from '@/store/main'
import { formatTime } from '@/utils'

const mainStore = useMainStore()

const {
  newsLoading,
  newsUpdateTime,
  channelConfig,
  showRssInfo,
} = storeToRefs(mainStore)
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
    <button v-if="channelConfig.rss !== false" class="ml-2 hover:text-blue-500" @click="showRssInfo = true">
      <IconRss class="size-4" />
    </button>
    <Transition name="fade">
      <RssInfo v-if="showRssInfo" @close="showRssInfo = false" />
    </Transition>
  </div>
</template>

<style scoped>

</style>
