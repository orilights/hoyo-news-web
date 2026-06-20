<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import IconClose from '@/components/icon/IconClose.vue'
import { useMainStore } from '@/store/main'
import NewsFilter from './NewsFilter.vue'

const mainStore = useMainStore()
const { showMobileSidebar } = storeToRefs(mainStore)

const isDesktop = useMediaQuery('(min-width: 768px)')
</script>

<template>
  <div v-if="isDesktop" class="w-[400px]">
    <div class="fixed left-0 top-0 h-screen w-[400px] overflow-y-auto border-r bg-white p-4" @scroll.stop @wheel.stop>
      <NewsFilter />
    </div>
  </div>

  <Transition v-if="!isDesktop" name="mobile-sidebar">
    <div
      v-show=" showMobileSidebar"
      class="fixed inset-0 z-50"
      @scroll.stop
      @wheel.stop
    >
      <div class="relative z-10 flex size-full flex-col bg-white shadow-xl">
        <div class="flex items-center border-b px-4 py-2">
          <button
            class="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            @click="showMobileSidebar = false"
          >
            <IconClose class="size-6" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4">
          <NewsFilter />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.mobile-sidebar-enter-active ,
.mobile-sidebar-leave-active  {
  transition: transform 0.3s ease;
}

.mobile-sidebar-enter-from ,
.mobile-sidebar-leave-to  {
  transform: translateX(-100%);
}
</style>
