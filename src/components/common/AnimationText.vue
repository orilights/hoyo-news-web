<script setup lang="ts">
const props = defineProps<{
  show: boolean
}>()

const textRef = ref<HTMLElement | null>(null)
const scrollWidth = ref(0)

onMounted(() => {
  scrollWidth.value = textRef.value?.scrollWidth || 0
})

watch(() => props.show, (show) => {
  if (show) {
    scrollWidth.value = textRef.value?.scrollWidth || 0
  }
}, { immediate: true })
</script>

<template>
  <span
    ref="textRef"
    :style="{
      width: show ? `${scrollWidth}px` : '0px',
      transition: 'width .3s ease-out',
    }"
    class="whitespace-nowrap"
  >
    <slot />
  </span>
</template>

<style scoped>

</style>
