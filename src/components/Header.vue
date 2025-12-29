<script setup lang="ts">
import { storeToRefs } from 'pinia'
import AnimationText from '@/components/common/AnimationText.vue'
import Tabs from '@/components/common/Tabs.vue'
import IconSetting from '@/components/icon/IconSetting.vue'
import SettingPanel from '@/components/SettingPanel.vue'
import { useMainStore } from '@/store/main'
import { useSettingsStore } from '@/store/settings'

const mainStore = useMainStore()
const settings = useSettingsStore()
const { newsLoading, currentSource, currentChannel } = storeToRefs(mainStore)
const { autoHideHeader, headerSourceList } = storeToRefs(settings)

const headerRef = ref<HTMLElement | null>(null)
const headerPaddingRef = ref<HTMLElement | null>(null)
const showSettingPanel = ref(false)
const showHeader = ref(true)
const lastScrollTop = ref(0)

const tabs = computed(() => headerSourceList.value.find(item => item.key === currentSource.value)?.channels ?? [])

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
    class="fixed inset-x-0 top-0 z-10 bg-[#f3f4f6]/80 px-2 pt-4 backdrop-blur transition-all duration-300 md:mx-0 md:px-4 lg:inset-x-[calc(50%-480px)] lg:mx-[-32px] lg:px-8"
    :class="{ '-translate-y-full': !showHeader }"
  >
    <div class="relative mb-2 flex flex-wrap gap-1 pr-6">
      <button
        v-for="sourceInfo in headerSourceList" :key="sourceInfo.key"
        class="flex shrink-0 items-center overflow-hidden rounded-full border p-1 transition-colors"
        :class="{
          'hover:border-blue-500': !newsLoading,
          'border-blue-500 text-blue-500': currentSource === sourceInfo.key,
        }"
        :disabled="newsLoading || currentSource === sourceInfo.key"
        @click="mainStore.changeSource(sourceInfo.key)"
      >
        <img
          class="size-6 rounded-full md:size-8"
          :alt="sourceInfo.displayName"
          :src="`./images/icon/${sourceInfo.key}-48px.png`"
        >
        <AnimationText :show="currentSource === sourceInfo.key">
          <span class="mx-1 sm:mx-2">
            {{ sourceInfo.displayName }}
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
      class="overflow-x-auto whitespace-nowrap"
      :tabs="tabs"
      :selected-key="currentChannel"
      :disabled="newsLoading"
      @update:selected-key="mainStore.changeChannel($event!)"
    />
  </header>
</template>
