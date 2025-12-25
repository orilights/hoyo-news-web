<script setup lang="ts">
import type { Option } from 'artplayer'
import Artplayer from 'artplayer'

import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

const props = defineProps<{
  option: Partial<Option>
}>()

const emit = defineEmits(['getInstance'])

const art = shallowRef<Artplayer | null>(null)
const $container = ref<HTMLDivElement | null>(null)

onMounted(() => {
  art.value = new Artplayer({
    ...props.option,
    container: $container.value!,
  } as Option)
  emit('getInstance', art.value)
})

onBeforeUnmount(() => {
  art.value?.destroy(false)
})
</script>

<template>
  <div ref="$container" class="player-container" />
</template>

<style scoped>
.player-container {
  aspect-ratio: 16/9;
}
</style>
