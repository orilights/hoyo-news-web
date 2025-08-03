<script setup lang="ts">
import IconVideo from '@/components/icon/IconVideo.vue'

defineProps<{
  tags: TagInfo[]
  filterTag: string
}>()
defineEmits(['changeTag'])
</script>

<template>
  <ul class="mt-2 flex flex-wrap gap-1">
    <li
      v-for="tag in tags" :key="tag.name"
      class="relative inline-block cursor-pointer rounded-full border border-gray-400 px-2 py-0.5 text-xs transition-colors hover:border-blue-400 hover:text-blue-500 md:px-3 md:py-1 md:text-sm"
      :class="{
        '!border-blue-500 !bg-blue-500 !text-white': filterTag === tag.name,
      }"
      @click="$emit('changeTag', tag.name)"
    >
      <IconVideo
        v-if="tag.video"
        class="absolute right-[-4px] top-[-4px] size-3 md:size-4"
        :class="{
          'text-blue-500': filterTag !== tag.name,
          'text-blue-300': filterTag === tag.name,
        }"
      />
      {{ tag.name }} {{ tag.count }}
    </li>
  </ul>
</template>
