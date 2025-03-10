<script setup lang="ts">
defineProps<{
  tags: Record<string, number>
  filterTag: string
}>()
defineEmits(['changeTag'])
</script>

<template>
  <ul class="mt-2 flex flex-wrap gap-1">
    <li
      v-for="tag_name in Object.keys(tags).sort((a, b) => tags[b] - tags[a])" :key="tag_name"
      class="inline-block cursor-pointer rounded-full border border-gray-400 px-2 py-0.5 text-xs transition-colors hover:border-blue-400 hover:text-blue-500 md:px-3 md:py-1 md:text-sm"
      :class="{
        '!border-blue-500 !bg-blue-500 !text-white': filterTag === tag_name,
      }"
      @click="$emit('changeTag', tag_name)"
    >
      {{ tag_name }} {{ tags[tag_name] }}
    </li>
  </ul>
</template>
