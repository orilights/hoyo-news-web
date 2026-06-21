<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { TAG_ALL } from '@/constants/index.ts'
import { useMainStore } from '@/store/main'
import { useSettingsStore } from '@/store/settings'
import ChannelInfo from './ChannelInfo.vue'
import DropdownSelect from './common/DropdownSelect.vue'

const mainStore = useMainStore()
const settings = useSettingsStore()
const {
  currentSource,
  currentChannel,
  searchEnabled,
  newsDataKeywordFiltered,
  filterTag,
  filterTags,
  searchStr,
  showSetting,
  showMobileSidebar,
  isMobile,
} = storeToRefs(mainStore)
const { autoHideHeader, headerSourceList, tagMultiSelect, sourceSelectStyle } = storeToRefs(settings)

const headerRef = ref<HTMLElement | null>(null)
const headerPaddingRef = ref<HTMLElement | null>(null)
const showHeader = ref(true)
const lastScrollTop = ref(0)

const tabs = computed(() => headerSourceList.value.find(item => item.key === currentSource.value)?.channels ?? [])
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

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    headerPaddingRef.value!.style.height = `${entry.target.scrollHeight + 16}px`
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

  if (scrollTop <= 800 || autoHideHeader.value === false || !isMobile.value) {
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

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  resizeObserver.observe(headerRef.value!)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  resizeObserver.disconnect()
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

      <template v-if="sourceSelectStyle === 'dropdown'">
        <DropdownSelect
          :model-value="currentSource"
          :options="headerSourceList.map(s => ({ value: s.key, label: s.displayName }))"
          @update:model-value="(val) => mainStore.changeSource(val)"
        >
          <template #trigger="{ label, value }">
            <img
              class="size-6 rounded-full md:size-6"
              :src="`./images/icon/${value}-48px.png`"
            >
            <span>{{ label }}</span>
          </template>
          <template #option="{ option }">
            <img
              class="size-6 rounded-full md:size-6"
              :alt="option.label"
              :src="`./images/icon/${option.value}-48px.png`"
            >
            {{ option.label }}
          </template>
        </DropdownSelect>

        <DropdownSelect
          :model-value="currentChannel"
          :options="tabs.map(c => ({ value: c.key, label: c.label }))"
          @update:model-value="(val) => mainStore.changeChannel(val)"
        >
          <template #trigger="{ label }">
            <div class="h-6 leading-6">
              {{ label }}
            </div>
          </template>
          <template #option="{ option }">
            <div class="h-6 leading-6">
              {{ option.label }}
            </div>
          </template>
        </DropdownSelect>
      </template>
      <template v-else>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="source in headerSourceList" :key="source.key"
            class="flex shrink-0 items-center overflow-hidden rounded-full border p-1 transition-colors hover:border-blue-500"
            :class="{
              'border-blue-500 text-blue-500': currentSource === source.key,
            }"
            :disabled="currentSource === source.key"
            @click="mainStore.changeSource(source.key)"
          >
            <img
              class="size-6 rounded-full md:size-6"
              :alt="source.displayName"
              :src="`./images/icon/${source.key}-48px.png`"
            >
            <AnimationText :show="currentSource === source.key">
              <span class="mx-1 sm:mx-2">{{ source.displayName }}</span>
            </AnimationText>
          </button>
        </div>
      </template>

      <button class="ml-auto" @click="handleChangeDialogSettingVisible">
        <LucideSlidersHorizontal class="size-4" />
      </button>
    </div>

    <Tabs
      v-if="sourceSelectStyle === 'tab'"
      v-model:selected-key="currentChannel"
      class="overflow-x-auto whitespace-nowrap"
      :tabs="tabs"
      @update:selected-key="(val) => val && mainStore.changeChannel(val)"
    />

    <ChannelInfo class="mt-2" />

    <div v-if="searchEnabled || isFiltering" class="mb-2 text-sm">
      <template v-if="searchEnabled">
        <span>
          搜索到 {{ newsDataKeywordFiltered.length }} 个结果
        </span>
        <button class="ml-2 mr-4 text-gray-500 hover:text-blue-500" @click="searchStr = ''">
          取消搜索
        </button>
      </template>
      <template v-if="isFiltering">
        <span>
          当前过滤：{{ filterDisplayText }}
        </span>
        <button class="ml-2 text-gray-500 hover:text-blue-500" @click="tagMultiSelect ? (filterTags = []) : mainStore.changeTag(TAG_ALL)">
          取消过滤
        </button>
      </template>
    </div>
  </header>
</template>
