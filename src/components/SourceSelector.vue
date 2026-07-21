<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/store/main'
import { useSettingsStore } from '@/store/settings'
import DropdownSelect from './common/DropdownSelect.vue'

const mainStore = useMainStore()
const settings = useSettingsStore()
const { currentSource, currentChannel } = storeToRefs(mainStore)
const { headerSourceList, sourceSelectStyle } = storeToRefs(settings)

const channels = computed(() => headerSourceList.value.find(item => item.key === currentSource.value)?.channels ?? [])
</script>

<template>
  <template v-if="sourceSelectStyle === 'dropdown'">
    <DropdownSelect
      :model-value="currentSource"
      :options="headerSourceList.map(s => ({ value: s.key, label: s.displayName }))"
      @update:model-value="(val) => mainStore.changeSource(val)"
    >
      <template #trigger="{ label, value }">
        <img
          class="size-6 rounded-full md:size-6"
          :src="`./images/icon/${value}-48px.png`"
        >
        <span>{{ label }}</span>
      </template>
      <template #option="{ option }">
        <img
          class="size-6 rounded-full md:size-6"
          :alt="option.label"
          :src="`./images/icon/${option.value}-48px.png`"
        >
        {{ option.label }}
      </template>
    </DropdownSelect>

    <DropdownSelect
      :model-value="currentChannel"
      :options="channels.map(c => ({ value: c.key, label: c.label }))"
      @update:model-value="(val) => mainStore.changeChannel(val)"
    >
      <template #trigger="{ label }">
        <div class="h-6 leading-6">
          {{ label }}
        </div>
      </template>
      <template #option="{ option }">
        <div class="h-6 leading-6">
          {{ option.label }}
        </div>
      </template>
    </DropdownSelect>
  </template>

  <template v-if="sourceSelectStyle === 'tab'">
    <div class="flex flex-wrap gap-1">
      <button
        v-for="source in headerSourceList" :key="source.key"
        class="flex shrink-0 items-center overflow-hidden rounded-full border p-1 transition-colors hover:border-blue-500"
        :class="{
          'border-blue-500 text-blue-500': currentSource === source.key,
        }"
        :disabled="currentSource === source.key"
        @click="mainStore.changeSource(source.key)"
      >
        <img
          class="size-6 rounded-full md:size-6"
          :alt="source.displayName"
          :src="`./images/icon/${source.key}-48px.png`"
        >
        <AnimationText :show="currentSource === source.key">
          <span class="mx-1 sm:mx-2">{{ source.displayName }}</span>
        </AnimationText>
      </button>
    </div>
  </template>
</template>
