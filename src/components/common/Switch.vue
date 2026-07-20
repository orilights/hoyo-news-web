<script setup lang="ts">
const { modelValue, disabled } = defineProps<{
  modelValue: boolean
  disabled?: boolean
}>()
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div
    class="relative inline-block h-[20px] w-[40px] rounded-[20px] transition-colors duration-300"
    :class="{
      'bg-[#dcdfe6] dark:bg-[#4c4d4f]': !modelValue,
      'bg-[#409eff]': modelValue,
      'pointer-events-none opacity-60': disabled,
      'cursor-pointer': !disabled,
    }"
    @click="!disabled && emit('update:modelValue', !modelValue)"
  >
    <div
      class="absolute left-[2px] top-[2px] size-[16px] rounded-full bg-white transition-transform duration-300"
      :class="{ 'translate-x-[20px]': modelValue }"
    />
  </div>
</template>
