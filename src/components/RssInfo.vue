<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useMainStore } from '@/store/main'
import { copyToClipboard } from '@/utils'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const mainStore = useMainStore()

const {
  currentSource,
  currentChannel,
  channelConfig,
} = storeToRefs(mainStore)

const whitelist = ref<string[]>([])
const blacklist = ref<string[]>([])

const filterInput = ref({
  whitelist: '',
  blacklist: '',
})

function generateRssLink() {
  const url = new URL(`${channelConfig.value.apiBase}/news/feed/${currentSource.value}.${currentChannel.value}`)
  whitelist.value.length && url.searchParams.append('whitelist', whitelist.value.join(','))
  blacklist.value.length && url.searchParams.append('blacklist', blacklist.value.join(','))
  return url.toString()
}

function addWhitelist() {
  const value = filterInput.value.whitelist.trim()
  if (value && !whitelist.value.includes(value)) {
    whitelist.value.push(value)
    filterInput.value.whitelist = ''
  }
}

function addBlacklist() {
  const value = filterInput.value.blacklist.trim()
  if (value && !blacklist.value.includes(value)) {
    blacklist.value.push(value)
    filterInput.value.blacklist = ''
  }
}

function copyRssLink() {
  copyToClipboard(generateRssLink())
    .then(() => {
      useToast().success('已复制RSS链接')
    })
    .catch((err) => {
      useToast().error(err?.message || '复制失败')
    })
  emit('close')
}
</script>

<template>
  <div class="fixed left-0 top-0 z-50 h-screen w-screen bg-black/30">
    <div class="size-full" @click="emit('close')" />
    <div class="fixed left-1/2 top-1/2 z-50 w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-4 shadow-md">
      <div class="mb-2 font-bold">
        生成RSS订阅链接
      </div>

      <div class="overflow-x-auto rounded bg-gray-100 p-2 font-mono shadow-md">
        {{ generateRssLink() }}
      </div>

      <div class="mt-2">
        <div class="flex gap-2">
          <div class="shrink-0">
            关键词白名单：
          </div>
          <input v-model="filterInput.whitelist" placeholder="请输入" type="text" class="flex-1 border px-2">
          <button
            class="shrink-0 rounded-md border px-2 py-0.5 transition-colors hover:border-blue-500"
            @click="addWhitelist"
          >
            添加
          </button>
        </div>
        <div class="flex flex-wrap gap-1">
          <template v-for="(item, index) in whitelist" :key="`whitelist-${index}`">
            <span class="rounded bg-green-100 px-2 py-0.5" @click="whitelist.splice(index, 1)">
              {{ item }}
            </span>
          </template>
        </div>
      </div>

      <div class="mt-2">
        <div class="flex gap-2">
          <div class="shrink-0">
            关键词黑名单：
          </div>
          <input v-model="filterInput.blacklist" placeholder="请输入" type="text" class="flex-1 border px-2">
          <button
            class="shrink-0 rounded-md border px-2 py-0.5 transition-colors hover:border-blue-500"
            @click="addBlacklist"
          >
            添加
          </button>
        </div>
        <div class="flex flex-wrap gap-1">
          <template v-for="(item, index) in blacklist" :key="`blacklist-${index}`">
            <span class="rounded bg-red-100 px-2 py-0.5" @click="blacklist.splice(index, 1)">
              {{ item }}
            </span>
          </template>
        </div>
      </div>

      <div class="mt-2 flex justify-end gap-2">
        <button
          class="rounded-md border bg-blue-500 px-2 py-0.5 text-white transition-colors hover:border-blue-500"
          @click="copyRssLink"
        >
          复制
        </button>
        <button
          class="rounded-md border px-2 py-0.5 transition-colors hover:border-blue-500"
          @click="emit('close')"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
