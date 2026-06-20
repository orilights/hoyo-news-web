<script setup lang="ts">
defineProps<{
  tags: TagInfo[]
  filterTag: string
  multiSelect?: boolean
  selectedTags?: string[]
}>()
defineEmits(['changeTag'])
</script>

<template>
  <ul class="mt-2 flex flex-wrap gap-1">
    <li
      v-for="tag in tags" :key="tag.name"
      class="relative inline-block cursor-pointer rounded-full border border-gray-400 px-2 py-0.5 text-xs transition-colors hover:border-blue-400 hover:text-blue-500"
      :class="{
        '!border-blue-500 !bg-blue-500 !text-white': multiSelect ? selectedTags?.includes(tag.name) : filterTag === tag.name,
      }"
      @click="$emit('changeTag', tag.name)"
    >
      <LucideVideo
        v-if="tag.video"
        class="absolute right-[-4px] top-[-4px] size-3"
        :class="{
          'text-blue-500': multiSelect ? !selectedTags?.includes(tag.name) : filterTag !== tag.name,
          'text-blue-300': multiSelect ? selectedTags?.includes(tag.name) : filterTag === tag.name,
        }"
        fill="currentColor"
      />
      {{ tag.name }} {{ tag.count }}
    </li>
  </ul>
</template>
