<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { TAG_ALL } from '@/constants/index.ts'
import { useMainStore } from '@/store/main'
import { useSettingsStore } from '@/store/settings'
import { ChannelType } from '@/types/enum'
import ChannelInfo from './ChannelInfo.vue'
import Switch from './common/Switch.vue'
import SourceSelector from './SourceSelector.vue'

const mainStore = useMainStore()
const settings = useSettingsStore()
const {
  currentSource,
  currentChannel,
  searchEnabled,
  isFulltextSearching,
  newsDataKeywordFiltered,
  filterTag,
  filterTags,
  searchStr,
  fulltextSearchResults,
  fulltextSearchMs,
  showSetting,
  showMobileSidebar,
  showMobileSearch,
  isMobile,
  fulltextSearchEnabled,
  channelConfig,
  isFulltextSearchAvailable,
} = storeToRefs(mainStore)
const { autoHideHeader, headerSourceList, tagMultiSelect, sourceSelectStyle } = storeToRefs(settings)

const headerRef = ref<HTMLElement | null>(null)
const headerPaddingRef = ref<HTMLElement | null>(null)
const mobileSearchInputRef = ref<HTMLInputElement | null>(null)
const showHeader = ref(true)
const lastScrollTop = ref(0)

const channels = computed(() => headerSourceList.value.find(item => item.key === currentSource.value)?.channels ?? [])

const isFiltering = computed(() => {
  if (tagMultiSelect.value)
    return filterTags.value.length > 0
  return filterTag.value !== TAG_ALL
})
const filterDisplayText = computed(() => {
  if (tagMultiSelect.value)
    return filterTags.value.join('、')
  return filterTag.value
})

const { height: headerHeight } = useElementSize(headerRef)
watch(headerHeight, (h) => {
  if (headerPaddingRef.value && h) {
    headerPaddingRef.value.style.height = `${h + 16}px`
  }
})

watch(showMobileSearch, (val) => {
  if (val) {
    nextTick(() => {
      mobileSearchInputRef.value?.focus()
    })
  }
})

watch(channelConfig, (val) => {
  if (val.type === ChannelType.WEBSITE_NEWS_OS && fulltextSearchEnabled.value) {
    mainStore.toggleFulltextSearch()
  }
})

function handleChangeDialogSettingVisible() {
  showSetting.value = !showSetting.value
  if (showSetting.value) {
    window.umami?.track('d-setting')
  }
}

function handleScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop

  if (scrollTop <= 800 || autoHideHeader.value === false || !isMobile.value || showMobileSearch.value) {
    showHeader.value = true
  }
  else {
    showHeader.value = scrollTop < lastScrollTop.value
    if (!showHeader.value) {
      showSetting.value = false
    }
  }
  lastScrollTop.value = scrollTop
}

function handleCloseSearch() {
  showMobileSearch.value = false
  searchStr.value = ''
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div ref="headerPaddingRef" />
  <header
    ref="headerRef"
    class="fixed inset-x-0 top-0 z-10 bg-white/80 px-2 pt-2 backdrop-blur transition-transform duration-300 md:left-[300px] md:px-4 lg:left-[400px]"
    :class="{
      '-translate-y-full': !showHeader && isMobile,
    }"
  >
    <div class="flex items-center gap-4">
      <button
        class="rounded p-1 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 md:hidden"
        @click="showMobileSidebar = true"
      >
        <LucideMenu class="size-4" />
      </button>

      <button
        v-show="!showMobileSearch"
        class="rounded p-1 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 md:hidden"
        @click="showMobileSearch = true"
      >
        <LucideSearch class="size-4" />
      </button>

      <template v-if="showMobileSearch && isMobile">
        <input
          ref="mobileSearchInputRef"
          v-model="searchStr"
          type="text"
          placeholder="请输入关键词搜索"
          class="flex-1 rounded-full border px-4 py-2 text-base outline-blue-500 transition-colors hover:border-blue-500"
        >
        <button
          class="rounded p-1 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
          @click="handleCloseSearch"
        >
          <LucideX class="size-4" />
        </button>
      </template>

      <template v-else>
        <SourceSelector />

        <button class="ml-auto" @click="handleChangeDialogSettingVisible">
          <LucideSlidersHorizontal class="size-4" />
        </button>
      </template>
    </div>

    <Tabs
      v-if="sourceSelectStyle === 'tab' && !(showMobileSearch && isMobile)"
      :selected-key="currentChannel"
      class="overflow-x-auto whitespace-nowrap"
      :tabs="channels"
      @update:selected-key="(val) => val && mainStore.changeChannel(val)"
    />

    <ChannelInfo v-if="!isFulltextSearching && !(showMobileSearch && isMobile)" class="py-1" />

    <div v-if="showMobileSearch || searchEnabled || isFiltering" class="flex flex-wrap gap-2 py-2 text-sm">
      <template v-if="searchEnabled">
        <span v-if="isFulltextSearching">
          搜索到 {{ fulltextSearchResults.length }} 个结果，耗时：{{ fulltextSearchMs }}ms
        </span>
        <span v-else>
          搜索到 {{ newsDataKeywordFiltered.length }} 个结果
        </span>
        <button class="text-gray-500 hover:text-blue-500" @click="searchStr = ''">
          取消搜索
        </button>
      </template>
      <template v-if="isFiltering">
        <span>
          当前过滤：{{ filterDisplayText }}
        </span>
        <button class="text-gray-500 hover:text-blue-500" @click="tagMultiSelect ? (filterTags = []) : mainStore.changeTag(TAG_ALL)">
          取消过滤
        </button>
      </template>

      <div v-if="showMobileSearch && isMobile && isFulltextSearchAvailable" class="flex items-center gap-2">
        <Switch :model-value="fulltextSearchEnabled" @update:model-value="mainStore.toggleFulltextSearch()" />
        <span class="text-gray-600">全文搜索（测试）</span>
      </div>
    </div>
  </header>
</template>
