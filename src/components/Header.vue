<script setup lang="ts">
import { storeToRefs } from 'pinia'
import IconMenu from '@/components/icon/IconMenu.vue'
import IconSetting from '@/components/icon/IconSetting.vue'
import SettingPanel from '@/components/SettingPanel.vue'
import { TAG_ALL } from '@/constants/index.ts'
import { useMainStore } from '@/store/main'
import { useSettingsStore } from '@/store/settings'
import ChannelInfo from './ChannelInfo.vue'
import DropdownSelect from './common/DropdownSelect.vue'

const mainStore = useMainStore()
const settings = useSettingsStore()
const { currentSource, currentChannel, searchEnabled, newsDataKeywordFiltered, filterTag, filterTags, searchStr, showMobileSidebar } = storeToRefs(mainStore)
const { autoHideHeader, headerSourceList, tagMultiSelect } = storeToRefs(settings)

const headerRef = ref<HTMLElement | null>(null)
const headerPaddingRef = ref<HTMLElement | null>(null)
const showSettingPanel = ref(false)
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
    headerPaddingRef.value!.style.height = `${entry.contentRect.height + 20}px`
  }
})

function handleChangeDialogSettingVisible() {
  showSettingPanel.value = !showSettingPanel.value
  if (showSettingPanel.value) {
    window.umami?.track('d-setting')
  }
}

function handleScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop

  if (scrollTop <= 800 || autoHideHeader.value === false) {
    showHeader.value = true
  }
  else {
    showHeader.value = scrollTop < lastScrollTop.value
    if (!showHeader.value) {
      showSettingPanel.value = false
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
    class="fixed inset-x-0 top-0 z-10 bg-white/80 px-4 pt-2 backdrop-blur transition-all duration-300 md:left-[400px]"
    :class="{
      '-translate-y-full': !showHeader,
    }"
  >
    <div class="mb-2 flex items-center gap-2">
      <button
        class="rounded p-1 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 md:hidden"
        @click="showMobileSidebar = true"
      >
        <IconMenu class="size-6" />
      </button>

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
    </div>

    <ChannelInfo />

    <div>
      <div v-show="searchEnabled" class="mb-2 text-sm">
        <span>
          搜索到 {{ newsDataKeywordFiltered.length }} 个结果
        </span>
        <button class="ml-2 text-gray-500 hover:text-blue-500" @click="searchStr = ''">
          取消搜索
        </button>
        <template v-if="isFiltering">
          <span class="ml-4">
            当前过滤：{{ filterDisplayText }}
          </span>
          <button class="ml-2 text-gray-500 hover:text-blue-500" @click="tagMultiSelect ? (filterTags = []) : mainStore.changeTag(TAG_ALL)">
            取消过滤
          </button>
        </template>
      </div>
    </div>

    <div class="absolute right-4 top-4 flex gap-4">
      <button class="setting" @click="handleChangeDialogSettingVisible">
        <IconSetting class="size-6" />
      </button>
    </div>

    <SettingPanel v-model:visible="showSettingPanel" />
  </header>
</template>
