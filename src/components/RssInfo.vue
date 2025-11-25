<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useMainStore } from '@/store/main'
import { useSettingsStore } from '@/store/settings'
import { copyToClipboard } from '@/utils'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const mainStore = useMainStore()
const settings = useSettingsStore()
const toast = useToast()

const {
  currentSource,
  currentChannel,
  channelConfig,
} = storeToRefs(mainStore)

const {
  rssFilter,
} = storeToRefs(settings)

const filterInput = ref({
  whitelist: '',
  blacklist: '',
})

const whitelist = ref<string[]>([])
const blacklist = ref<string[]>([])

const cacheKey = computed(() => `${currentSource.value}_${currentChannel.value}`)

onMounted(() => {
  whitelist.value = rssFilter.value[cacheKey.value]?.whitelist || []
  blacklist.value = rssFilter.value[cacheKey.value]?.blacklist || []
})

function saveFilter() {
  settings.rssFilter[cacheKey.value] = {
    whitelist: whitelist.value,
    blacklist: blacklist.value,
  }
}

function generateRssLink(encode = true) {
  let baseRssUrl = `${channelConfig.value.apiBase}/news/feed/${currentSource.value}.${currentChannel.value}`
  if (whitelist.value.length) {
    const whitelistStr = whitelist.value.join(',')
    baseRssUrl += `?whitelist=${encode ? encodeURIComponent(whitelistStr) : whitelistStr}`
  }
  if (blacklist.value.length) {
    const blacklistStr = blacklist.value.join(',')
    baseRssUrl += `${whitelist.value.length ? '&' : '?'}blacklist=${encode ? encodeURIComponent(blacklistStr) : blacklistStr}`
  }
  return baseRssUrl.toString()
}

function validateFilterInput(input: string) {
  // 检查是否包含URL中需要转义的特殊字符
  const unsafeChars = /[ #%'()*+,/;<=>?@[\\\]^`{|}]/
  return !unsafeChars.test(input)
}

function addWhitelist() {
  const value = filterInput.value.whitelist.trim()
  if (!validateFilterInput(value)) {
    toast.warning('关键词中不能包含特殊符号或空格')
    return
  }
  if (value && !whitelist.value.includes(value)) {
    whitelist.value.push(value)
    filterInput.value.whitelist = ''
    saveFilter()
  }
}

function addBlacklist() {
  const value = filterInput.value.blacklist.trim()
  if (!validateFilterInput(value)) {
    toast.warning('关键词中不能包含特殊符号或空格')
    return
  }
  if (value && !blacklist.value.includes(value)) {
    blacklist.value.push(value)
    filterInput.value.blacklist = ''
    saveFilter()
  }
}

function removeFilterItem(list: string[], index: number) {
  list.splice(index, 1)
  saveFilter()
}

function copyRssLink() {
  copyToClipboard(generateRssLink(true))
    .then(() => {
      toast.success('已复制RSS链接')
    })
    .catch((err) => {
      toast.error(err?.message || '复制失败')
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

      <div class="overflow-x-auto rounded bg-gray-100 p-2 font-mono text-sm shadow-md">
        {{ generateRssLink(false) }}
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
            <span class="rounded bg-green-100 px-2 py-0.5" @click="removeFilterItem(whitelist, index)">
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
            <span class="rounded bg-red-100 px-2 py-0.5" @click="removeFilterItem(blacklist, index)">
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
