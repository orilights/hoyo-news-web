<script setup lang="ts">
import type Artplayer from 'artplayer'
import { storeToRefs } from 'pinia'
import { usePlayerStore } from '@/store/player'
import IconClose from './icon/IconClose.vue'
import ArtPlayer from './player/ArtPlayer.vue'

const playerStore = usePlayerStore()

const { title, videoSrc } = storeToRefs(playerStore)

const artInstance = ref<Artplayer | null>(null)

const playerOption = computed(() => ({
  url: videoSrc.value,
  fullscreen: true,
  playbackRate: true,
  aspectRatio: true,
  setting: true,
}))
</script>

<template>
  <div v-show="videoSrc" class="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/30 backdrop-blur-sm">
    <div class="w-full max-w-[960px] rounded-lg bg-white p-4 shadow-md">
      <div class="mb-4 flex items-center justify-between">
        <div>{{ title }}</div>
        <button @click="playerStore.stopVideo()">
          <IconClose class="size-5 text-gray-500 hover:text-black" />
        </button>
      </div>
      <ArtPlayer
        v-if="videoSrc"
        :option="playerOption"
        @get-instance="artInstance = $event"
      />
    </div>
  </div>
</template>

<style scoped>

</style>
