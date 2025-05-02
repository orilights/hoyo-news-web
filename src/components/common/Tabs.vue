<script setup lang="ts">
withDefaults(defineProps<{
  tabs: TabItem[]
  disabled?: boolean
}>(), {
  disabled: false,
})

const selectedKey = defineModel('selectedKey', {
  type: String,
})

interface TabItem {
  key: string
  label: string
}
</script>

<template>
  <div>
    <button
      v-for="tab in tabs" :key="tab.key"
      class="border-b-2 bg-transparent px-2 py-1 transition-colors"
      :class="{
        'hover:text-blue-500': !disabled,
        'border-blue-500 text-blue-500': selectedKey === tab.key,
      }"
      :disabled="disabled || selectedKey === tab.key"
      @click="selectedKey = tab.key"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
