<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/store/main'

const mainStore = useMainStore()
const { showMobileSidebar, isMobile } = storeToRefs(mainStore)
</script>

<template>
  <div v-if="!isMobile" class="w-[300px] lg:w-[400px]">
    <div class="fixed left-0 top-0 h-screen w-[300px] overflow-y-auto border-r bg-white p-4 lg:w-[400px]" @scroll.stop @wheel.stop>
      <SidebarContent />
    </div>
  </div>

  <Transition v-if="isMobile" name="mobile-sidebar">
    <div
      v-show="showMobileSidebar"
      class="fixed inset-0 z-50"
      @scroll.stop
      @wheel.stop
    >
      <div class="relative z-10 flex size-full flex-col bg-white shadow-xl">
        <div class="flex items-center border-b p-2">
          <button
            class="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            @click="showMobileSidebar = false"
          >
            <LucideX class="size-4" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-2">
          <SidebarContent />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.mobile-sidebar-enter-active ,
.mobile-sidebar-leave-active  {
  transition: transform  0.3s ease, opacity 0.3s ease;
}

.mobile-sidebar-enter-from ,
.mobile-sidebar-leave-to  {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
