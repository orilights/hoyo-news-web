<script setup lang="ts">
import { storeToRefs } from 'pinia'
import AnimationText from '@/components/common/AnimationText.vue'
import Tabs from '@/components/common/Tabs.vue'
import { NEWS_LIST } from '@/constants'
import { useMainStore } from '@/store/main'

const mainStore = useMainStore()

const { newsLoading, currentSource, currentChannel, headerSticky } = storeToRefs(mainStore)

const headerRef = ref<HTMLElement | null>(null)

const tabs = computed(() => {
  return Object.entries(NEWS_LIST[currentSource.value].channels).map(([key, value]) => ({
    key,
    label: value.displayName,
  }))
})

onMounted(() => {
  document.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  document.removeEventListener('scroll', handleScroll)
})

function handleScroll() {
  headerSticky.value = (headerRef.value?.getBoundingClientRect().top || 0) === 0 && window.scrollY > 0
}
</script>

<template>
  <div
    ref="headerRef"
    class="header sticky top-0 z-10 pt-2 backdrop-blur transition-all"
    :class="{
      'mx-[-8px] bg-[#f3f4f6]/80 pl-2 pr-4 md:mx-[-32px] md:px-8': headerSticky,
    }"
  >
    <div
      class="mb-2 flex flex-wrap gap-1"
      :class="{
        'pr-4': headerSticky,
      }"
    >
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
