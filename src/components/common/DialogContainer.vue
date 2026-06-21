<script setup lang="ts">
withDefaults(defineProps<{
  show: boolean
  title: string
  width?: number
  fullHeight?: boolean
}>(), {
  width: 500,
  fullHeight: false,
})

defineEmits<{
  close: []
}>()
</script>

<template>
  <Transition name="fade">
    <div
      v-show="show"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/30 backdrop-blur-sm"
      @click="$emit('close')"
    >
      <div
        class="flex w-full flex-col bg-white p-4 shadow-md"
        :class="{
          'rounded-xl': !fullHeight,
          'h-full': fullHeight,
        }"
        :style="{ maxWidth: `${width}px` }"
        @click.prevent.stop
      >
        <div class="mb-3 flex shrink-0 items-center justify-between">
          <span class="text-base font-bold">{{ title }}</span>
          <LucideX class="size-5 shrink-0 cursor-pointer text-gray-400 transition-colors hover:text-gray-600" @click="$emit('close')" />
        </div>
        <div class="min-h-0 flex-1">
          <slot />
        </div>
      </div>
    </div>
  </Transition>
</template>
