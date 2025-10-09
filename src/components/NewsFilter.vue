<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/store/main'
import TagList from './TagList.vue'

const mainStore = useMainStore()

const {
  availableTags,
  newsDataSorted,
  filterTag,
  searchStr,
  searchEnabled,
  sortBy,
  dateFilterStart,
  dateFilterEnd,
} = storeToRefs(mainStore)
</script>

<template>
  <input
    v-model="searchStr" type="text" placeholder="搜些什么吧"
    class="mb-2 w-full rounded-full border px-4 py-2 outline-blue-500 transition-colors hover:border-blue-500"
  >
  <div v-show="searchEnabled" class="mb-2">
    <span>
      搜索结果：{{ newsDataSorted.length }} 条
    </span>
    <button class="ml-4 hover:text-blue-500" @click="searchStr = ''">
      取消搜索
    </button>
  </div>

  <details v-show="!searchEnabled" class="mb-2" open>
    <summary>分类</summary>
    <TagList :tags="availableTags" :filter-tag="filterTag" @change-tag="mainStore.changeTag" />
  </details>

  <div class="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
    <span>
      排序：
      <select
        v-model="sortBy"
        class="rounded-md border border-black/20 bg-transparent px-1 transition-colors hover:border-blue-500"
      >
        <option value="desc">
          降序
        </option>
        <option value="asc">
          升序
        </option>
      </select>
    </span>

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
