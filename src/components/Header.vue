<script setup lang="ts">
import { storeToRefs } from 'pinia'
import AnimationText from '@/components/common/AnimationText.vue'
import Tabs from '@/components/common/Tabs.vue'
import IconSetting from '@/components/icon/IconSetting.vue'
import SettingPanel from '@/components/SettingPanel.vue'
import { NEWS_LIST } from '@/constants'
import { useMainStore } from '@/store/main'
import { useSettingsStore } from '@/store/settings'

const mainStore = useMainStore()
const settings = useSettingsStore()
const { newsLoading, currentSource, currentChannel } = storeToRefs(mainStore)
const { autoHideHeader } = storeToRefs(settings)

const headerRef = ref<HTMLElement | null>(null)
const showSettingPanel = ref(false)
const showHeader = ref(true)
const lastScrollTop = ref(0)

const tabs = computed(() => {
  return Object.entries(NEWS_LIST[currentSource.value].channels).map(([key, value]) => ({
    key,
    label: value.displayName,
  }))
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
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div
    ref="headerRef"
    class="header sticky top-0 z-10 mx-[-8px] bg-[#f3f4f6]/80 px-2 pt-4 backdrop-blur transition-all duration-300 md:mx-[-32px] md:px-8"
    :class="{ '-translate-y-full': !showHeader }"
  >
    <div class="relative mb-2 flex flex-wrap gap-1 pr-6">
      <button
        v-for="[source_key, source_info] in Object.entries(NEWS_LIST)" :key="source_key"
        class="flex shrink-0 items-center overflow-hidden rounded-full border p-1 transition-colors"
        :class="{
          'hover:border-blue-500': !newsLoading,
          'border-blue-500 text-blue-500': currentSource === source_key,
        }"
        :disabled="newsLoading || currentSource === source_key"
        @click="mainStore.changeSource(source_key)"
      >
        <img
          class="size-6 rounded-full md:size-8"
          :alt="source_info.displayName"
          :src="`./images/icon/${source_key}-48px.png`"
        >
        <AnimationText :show="currentSource === source_key">
          <span class="mx-1 sm:mx-2">
            {{ source_info.displayName }}
          </span>
        </AnimationText>
      </button>

      <div class="absolute right-0 top-0 flex gap-4">
        <button class="setting" @click="handleChangeDialogSettingVisible">
          <IconSetting class="size-6" />
        </button>
      </div>

      <SettingPanel v-model:visible="showSettingPanel" />
    </div>

    <Tabs
      class="mb-2 overflow-x-auto whitespace-nowrap"
      :tabs="tabs"
      :selected-key="currentChannel"
      :disabled="newsLoading"
      @update:selected-key="mainStore.changeChannel($event!)"
    />
  </div>
</template>
