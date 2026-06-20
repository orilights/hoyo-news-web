<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  tags: TagInfo[]
  filterTag: string
  multiSelect?: boolean
  selectedTags?: string[]
}>()
defineEmits(['changeTag'])

interface TagGroup {
  group: string
  tags: TagInfo[]
}

const groups = computed<TagGroup[]>(() => {
  const ungrouped: TagInfo[] = []
  const groupMap = new Map<string, TagInfo[]>()
  const groupOrder: string[] = []

  for (const tag of props.tags) {
    if (!tag.group) {
      ungrouped.push(tag)
    }
    else {
      if (!groupMap.has(tag.group)) {
        groupMap.set(tag.group, [])
        groupOrder.push(tag.group)
      }
      groupMap.get(tag.group)!.push(tag)
    }
  }

  const result: TagGroup[] = []
  // 无分组的标签（"全部"、"视频"）始终排在最前面
  if (ungrouped.length > 0) {
    result.push({ group: '', tags: ungrouped })
  }
  // 有分组的标签按首次出现顺序排列
  for (const groupName of groupOrder) {
    result.push({ group: groupName, tags: groupMap.get(groupName)! })
  }
  return result
})

function isActive(tagName: string): boolean {
  if (props.multiSelect) {
    return props.selectedTags?.includes(tagName) ?? false
  }
  return props.filterTag === tagName
}
</script>

<template>
  <div class="mt-2 flex flex-col gap-2">
    <template v-for="tagGroup in groups" :key="tagGroup.group || '__ungrouped__'">
      <div v-if="tagGroup.group" class="text-xs font-semibold text-gray-500">
        {{ tagGroup.group }}
      </div>
      <ul class="flex flex-wrap gap-1">
        <li
          v-for="tag in tagGroup.tags" :key="tag.name"
          class="relative inline-block cursor-pointer rounded-full border border-gray-400 px-2 py-0.5 text-xs transition-colors hover:border-blue-400 hover:text-blue-500"
          :class="{
            '!border-blue-500 !bg-blue-500 !text-white': isActive(tag.name),
          }"
          @click="$emit('changeTag', tag.name)"
        >
          <LucideVideo
            v-if="tag.video"
            class="absolute right-[-4px] top-[-4px] size-3"
            :class="{
              'text-blue-500': !isActive(tag.name),
              'text-blue-300': isActive(tag.name),
            }"
            fill="currentColor"
          />
          {{ tag.name }} {{ tag.count }}
        </li>
      </ul>
    </template>
  </div>
</template>
