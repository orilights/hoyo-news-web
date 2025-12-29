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

  art.value.controls.add({
    name: 'previousFrame',
    position: 'left',
    html: art.value.icons.arrowLeft,
    tooltip: '上一帧',
    index: 25,
    click() {
      const player = art.value
      if (!player)
        return

      if (player.playing) {
        player.pause()
      }

      const frameDuration = 1.001 / 60
      player.currentTime = Math.max(0, player.currentTime - frameDuration)
    },
  })

  art.value.controls.add({
    name: 'nextFrame',
    position: 'left',
    html: art.value.icons.arrowRight,
    tooltip: '下一帧',
    index: 26,
    click() {
      const player = art.value
      if (!player)
        return

      if (player.playing) {
        player.pause()
      }

      const frameDuration = 1.001 / 60
      player.currentTime = Math.min(player.duration, player.currentTime + frameDuration)
    },
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
