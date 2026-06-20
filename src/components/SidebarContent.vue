<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Switch from '@/components/common/Switch.vue'
import TagList from '@/components/TagList.vue'
import { useMainStore } from '@/store/main'
import { useSettingsStore } from '@/store/settings'

const mainStore = useMainStore()
const settingsStore = useSettingsStore()

const {
  availableTags,
  filterTag,
  filterTags,
  searchStr,
  dateFilterStart,
  dateFilterEnd,
} = storeToRefs(mainStore)

const { tagMultiSelect } = storeToRefs(settingsStore)
</script>

<template>
  <input
    v-model="searchStr" type="text" placeholder="请输入关键词（可使用空格分隔多个关键词）"
    class="mb-2 w-full rounded-full border px-4 py-2 text-base outline-blue-500 transition-colors hover:border-blue-500"
  >

  <div class="mb-1 flex items-center gap-2">
    <Switch :model-value="tagMultiSelect" @update:model-value="val => tagMultiSelect = val" />
    <span class="text-sm text-gray-600">标签多选</span>
  </div>

  <TagList
    :tags="availableTags"
    :filter-tag="filterTag"
    :multi-select="tagMultiSelect"
    :selected-tags="filterTags"
    @change-tag="mainStore.changeTag"
  />

  <div class="my-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
    <span>
      开始日期：
      <input
        v-model="dateFilterStart" type="date"
        class="rounded-md border border-black/20 bg-transparent px-1 transition-colors hover:border-blue-500"
        :max="dateFilterEnd"
      >
    </span>

    <span>
      结束日期：
      <input
        v-model="dateFilterEnd" type="date"
        class="rounded-md border border-black/20 bg-transparent px-1 transition-colors hover:border-blue-500"
        :min="dateFilterStart"
      >
    </span>

    <button
      v-if="dateFilterStart || dateFilterEnd" class="hover:text-blue-500"
      @click="dateFilterStart = ''; dateFilterEnd = ''"
    >
      取消筛选
    </button>
  </div>
</template>

<style scoped>

</style>
