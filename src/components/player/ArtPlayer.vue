<script setup lang="ts">
import type { Option } from 'artplayer'
import Artplayer from 'artplayer'

import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

const props = defineProps<{
  option: Partial<Option>
}>()

const emit = defineEmits(['getInstance', 'videoEnded', 'destroy'])

const art = shallowRef<Artplayer | null>(null)
const $container = ref<HTMLDivElement | null>(null)

onMounted(() => {
  art.value = new Artplayer({
    ...props.option,
    container: $container.value!,
  } as Option, function onReady() {
    this.play()
  })
  emit('getInstance', art.value)
  art.value.on('video:ended', () => {
    emit('videoEnded')
  })
})

onBeforeUnmount(() => {
  art.value?.destroy()
  emit('destroy')
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
